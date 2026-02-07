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
  const [uploadProgress, setUploadProgress] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Ensure storage bucket exists on mount
  useEffect(() => {
    const ensureBucket = async () => {
      try {
        // Check if bucket exists by listing it
        const { data } = await supabase.storage.getBucket("interview-recordings");
        if (!data) {
          console.log("Interview recordings bucket not found, will be created on first upload");
        }
      } catch (err) {
        console.log("Storage bucket check:", err);
      }
    };
    ensureBucket();
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!applicationId || !candidateId) {
      setError("Missing application or candidate ID");
      console.error("Recording failed: Missing IDs", { applicationId, candidateId });
      return false;
    }

    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: "user",
          frameRate: { ideal: 24, max: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;
      chunksRef.current = [];
      startTimeRef.current = new Date();

      // Create MediaRecorder with optimal settings for web
      const mimeTypes = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm;codecs=h264,opus",
        "video/webm",
        "video/mp4",
      ];
      
      let selectedMimeType = "video/webm";
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      console.log("Using MIME type:", selectedMimeType);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 1500000, // 1.5 Mbps for balanced quality/size
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log(`Recording chunk received: ${event.data.size} bytes, total chunks: ${chunksRef.current.length}`);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("MediaRecorder stopped, processing recording...");
        await handleRecordingComplete();
      };

      mediaRecorder.onerror = (event: any) => {
        console.error("MediaRecorder error:", event.error || event);
        setError("Recording error occurred");
        toast({
          title: "Recording Error",
          description: "An error occurred during recording. Please try again.",
          variant: "destructive",
        });
      };

      mediaRecorderRef.current = mediaRecorder;
      
      // Start recording with timeslice for regular data collection
      mediaRecorder.start(3000); // Collect data every 3 seconds
      setIsRecording(true);
      setError(null);
      setUploadProgress(0);

      console.log("Recording started successfully");

      // Create initial recording entry in database
      const { data: recordingEntry, error: dbError } = await supabase
        .from("interview_recordings")
        .insert({
          application_id: applicationId,
          status: "recording",
          duration_minutes: 0,
        })
        .select()
        .single();

      if (dbError) {
        console.error("Failed to create recording entry:", dbError);
      } else if (recordingEntry) {
        setRecordingId(recordingEntry.id);
        console.log("Recording entry created:", recordingEntry.id);
      }

      return true;
    } catch (err: any) {
      console.error("Failed to start recording:", err);
      
      let errorMessage = "Failed to access camera/microphone";
      if (err.name === "NotAllowedError") {
        errorMessage = "Camera/microphone access denied. Please allow access and try again.";
      } else if (err.name === "NotFoundError") {
        errorMessage = "No camera or microphone found. Please connect a device and try again.";
      } else if (err.name === "NotReadableError") {
        errorMessage = "Camera/microphone is being used by another application.";
      }
      
      setError(errorMessage);
      toast({
        title: "Recording Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [applicationId, candidateId, toast]);

  // Stop recording
  const stopRecording = useCallback(() => {
    console.log("Stopping recording...");
    
    if (mediaRecorderRef.current && isRecording) {
      try {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      } catch (err) {
        console.error("Error stopping MediaRecorder:", err);
      }
      setIsRecording(false);
    }

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log(`Stopped track: ${track.kind}`);
      });
      streamRef.current = null;
    }

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  }, [isRecording]);

  // Handle recording completion and upload
  const handleRecordingComplete = useCallback(async () => {
    console.log("Handling recording complete, chunks:", chunksRef.current.length);
    
    if (chunksRef.current.length === 0) {
      console.error("No recording chunks available");
      setError("No recording data captured");
      return;
    }
    
    if (!applicationId || !candidateId) {
      console.error("Missing IDs for upload");
      return;
    }

    try {
      setUploadProgress(10);
      
      // Create blob from chunks
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      console.log(`Created blob: ${blob.size} bytes (${(blob.size / 1024 / 1024).toFixed(2)} MB)`);
      
      if (blob.size < 1000) {
        console.error("Recording too small, may be corrupted");
        setError("Recording appears to be empty or corrupted");
        return;
      }

      const timestamp = Date.now();
      const fileName = `${candidateId}/${applicationId}_${timestamp}.webm`;

      // Calculate duration
      const durationMinutes = startTimeRef.current
        ? Math.ceil((Date.now() - startTimeRef.current.getTime()) / 60000)
        : 0;

      setUploadProgress(30);
      console.log(`Uploading recording: ${fileName}`);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("interview-recordings")
        .upload(fileName, blob, {
          contentType: "video/webm",
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setUploadProgress(70);
      console.log("Upload successful:", uploadData);

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("interview-recordings")
        .getPublicUrl(fileName);

      const videoUrl = urlData?.publicUrl || fileName;
      console.log("Video URL:", videoUrl);

      setUploadProgress(85);

      // Update interview_recordings entry
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

      if (dbError) {
        console.error("Database update error:", dbError);
        // Don't throw - the file is uploaded, just DB update failed
      } else {
        console.log("Recording entry updated:", recording?.id);
      }

      setUploadProgress(100);
      setRecordingUrl(videoUrl);
      if (recording) {
        setRecordingId(recording.id);
      }
      
      onRecordingComplete?.(videoUrl);

      toast({
        title: "Recording Saved",
        description: `Interview recording saved successfully (${durationMinutes} min)`,
      });

      // Clear chunks after successful upload
      chunksRef.current = [];
      
    } catch (err: any) {
      console.error("Failed to save recording:", err);
      setError(err.message || "Failed to save recording");
      setUploadProgress(0);
      
      toast({
        title: "Save Failed",
        description: err.message || "Could not save the recording. Please try again.",
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
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  return {
    isRecording,
    recordingUrl,
    recordingId,
    error,
    uploadProgress,
    startRecording,
    stopRecording,
    getStream,
  };
}
