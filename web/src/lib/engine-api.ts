import axios from "axios";

const api = axios.create({ baseURL: "/api/engine" });

export interface PhotoSizeInfo {
  name: string;
  name_en: string;
  width_mm: number;
  height_mm: number;
  width_px: number;
  height_px: number;
}

export interface PaperSizeInfo {
  name: string;
  name_en: string;
  width_mm: number;
  height_mm: number;
  width_px: number;
  height_px: number;
}

export interface LayoutOptions {
  background_color: string;
  spacing_mm: number;
  margin_mm: number;
  cutting_guides: boolean;
  dpi: number;
}

export interface ZoneInfo {
  photo_size_key: string;
  rows: number;
  cols: number;
  count: number;
}

export interface LayoutResponse {
  layout_id: string;
  preview_url: string;
  zones: ZoneInfo[];
  total_photos: number;
  paper_width: number;
  paper_height: number;
}

export interface UploadResponse {
  photo_id: string;
  thumbnail_url: string;
  width: number;
  height: number;
}

export const engineApi = {
  getSizes: () =>
    api
      .get<{ photo_sizes: PhotoSizeInfo[]; paper_sizes: PaperSizeInfo[] }>(
        "/sizes",
      )
      .then((r) => r.data),

  uploadPhoto: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<UploadResponse>("/upload", form).then((r) => r.data);
  },

  createLayout: (
    photoId: string,
    body: {
      photo_size: string;
      paper_size: string;
      layout_mode: "uniform" | "mixed";
      options?: Partial<LayoutOptions>;
      large_size?: string;
      small_size?: string;
    },
  ) =>
    api
      .post<LayoutResponse>(`/layout?photo_id=${photoId}`, body)
      .then((r) => r.data),

  getPreviewUrl: (layoutId: string) => `/api/engine/preview/${layoutId}`,
  getDownloadUrl: (layoutId: string) => `/api/engine/download/${layoutId}`,
};
