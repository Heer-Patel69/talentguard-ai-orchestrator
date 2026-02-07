import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseInterviewRecordingOptions {
  applicationId: string | null;
  candidateId: string | null;
  onRecordingComplete?: (recordingUrl: string) => void;
}

export function useInterviewRecording({
  applicationId,
  candidateId,
  onRecordingComplete,
}: UseInterviewRecordingOptions) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!applicationId || !candidateId) {
      setError("Missing application or candidate ID");
      return false;
    }

    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;
      chunksRef.current = [];
      startTimeRef.current = new Date();

      // Create MediaRecorder with optimal settings
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : "video/webm";

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2500000, // 2.5 Mbps for good quality
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        await handleRecordingComplete();
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setError("Recording error occurred");
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(5000); // Collect data every 5 seconds
      setIsRecording(true);
      setError(null);

      return true;
    } catch (err: any) {
      console.error("Failed to start recording:", err);
      setError(err.message || "Failed to access camera/microphone");
      toast({
        title: "Recording Failed",
        description: "Could not access camera or microphone. Please check permissions.",
        variant: "destructive",
      });
      return false;
    }
  }, [applicationId, candidateId, toast]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, [isRecording]);

  // Handle recording completion and upload
  const handleRecordingComplete = useCallback(async () => {
    if (chunksRef.current.length === 0 || !applicationId || !candidateId) return;

    try {
      // Create blob from chunks
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const fileName = `${candidateId}/${applicationId}_${Date.now()}.webm`;

      // Calculate duration
      const durationMinutes = startTimeRef.current
        ? Math.ceil((Date.now() - startTimeRef.current.getTime()) / 60000)
        : 0;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("interview-recordings")
        .upload(fileName, blob, {
          contentType: "video/webm",
          cacheControl: "3600",
        });

      if (uploadError) throw uploadError;

      // Get the URL
      const { data: urlData } = supabase.storage
        .from("interview-recordings")
        .getPublicUrl(fileName);

      const videoUrl = urlData?.publicUrl || fileName;

      // Create or update interview_recordings entry
      const { data: recording, error: dbError } = await supabase
        .from("interview_recordings")
        .upsert({
          application_id: applicationId,
          video_url: videoUrl,
          duration_minutes: durationMinutes,
          status: "ready",
        }, {
          onConflict: "application_id",
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setRecordingUrl(videoUrl);
      setRecordingId(recording?.id || null);
      onRecordingComplete?.(videoUrl);

      toast({
        title: "Recording Saved",
        description: "Interview recording has been saved successfully.",
      });
    } catch (err: any) {
      console.error("Failed to save recording:", err);
      setError(err.message || "Failed to save recording");
      toast({
        title: "Save Failed",
        description: "Could not save the recording. Please try again.",
        variant: "destructive",
      });
    }
  }, [applicationId, candidateId, onRecordingComplete, toast]);

  // Get the media stream for video preview
  const getStream = useCallback(() => streamRef.current, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    isRecording,
    recordingUrl,
    recordingId,
    error,
    startRecording,
    stopRecording,
    getStream,
  };
}
