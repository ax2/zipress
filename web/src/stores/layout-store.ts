import { create } from "zustand";
import type {
  UploadResponse,
  LayoutResponse,
  PhotoSizeInfo,
  PaperSizeInfo,
} from "@/lib/engine-api";

interface LayoutState {
  photoSizes: PhotoSizeInfo[];
  paperSizes: PaperSizeInfo[];
  setSizes: (photo: PhotoSizeInfo[], paper: PaperSizeInfo[]) => void;

  uploadedPhoto: UploadResponse | null;
  setUploadedPhoto: (photo: UploadResponse | null) => void;

  photoSize: string;
  paperSize: string;
  layoutMode: "uniform" | "mixed";
  backgroundColor: string;
  cuttingGuides: boolean;
  spacingMm: number;
  setPhotoSize: (s: string) => void;
  setPaperSize: (s: string) => void;
  setLayoutMode: (m: "uniform" | "mixed") => void;
  setBackgroundColor: (c: string) => void;
  setCuttingGuides: (v: boolean) => void;
  setSpacingMm: (v: number) => void;

  layoutResult: LayoutResponse | null;
  setLayoutResult: (r: LayoutResponse | null) => void;

  isUploading: boolean;
  isGenerating: boolean;
  setIsUploading: (v: boolean) => void;
  setIsGenerating: (v: boolean) => void;

  reset: () => void;
}

const initialState = {
  photoSizes: [] as PhotoSizeInfo[],
  paperSizes: [] as PaperSizeInfo[],
  uploadedPhoto: null as UploadResponse | null,
  photoSize: "1寸",
  paperSize: "6寸",
  layoutMode: "uniform" as const,
  backgroundColor: "#FFFFFF",
  cuttingGuides: true,
  spacingMm: 1.0,
  layoutResult: null as LayoutResponse | null,
  isUploading: false,
  isGenerating: false,
};

export const useLayoutStore = create<LayoutState>((set) => ({
  ...initialState,
  setSizes: (photo, paper) => set({ photoSizes: photo, paperSizes: paper }),
  setUploadedPhoto: (photo) => set({ uploadedPhoto: photo, layoutResult: null }),
  setPhotoSize: (s) => set({ photoSize: s, layoutResult: null }),
  setPaperSize: (s) => set({ paperSize: s, layoutResult: null }),
  setLayoutMode: (m) => set({ layoutMode: m, layoutResult: null }),
  setBackgroundColor: (c) => set({ backgroundColor: c, layoutResult: null }),
  setCuttingGuides: (v) => set({ cuttingGuides: v, layoutResult: null }),
  setSpacingMm: (v) => set({ spacingMm: v, layoutResult: null }),
  setLayoutResult: (r) => set({ layoutResult: r }),
  setIsUploading: (v) => set({ isUploading: v }),
  setIsGenerating: (v) => set({ isGenerating: v }),
  reset: () => set(initialState),
}));
