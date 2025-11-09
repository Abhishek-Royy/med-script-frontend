import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

interface MedicalEntity {
  entity_type: string;
  entity_value: string;
  confidence_score: number;
  metadata?: Record<string, any>;
}

interface SafetyAlert {
  severity: string;
  title: string;
  description: string;
  action_required: boolean;
}

export interface AnalysisResult {
  document_id: string;
  document_type: string;
  summary: string;
  key_findings: string[];
  extracted_entities: MedicalEntity[];
  safety_assessment: SafetyAlert[];
  processing_status: string;
}

export interface UploadResponse {
  document_id: string;
  file_name: string;
  gcs_path: string;
  status: string;
  message: string;
}

export interface AnalysisStatus {
  document_id: string;
  status: string;
  message?: string;
}

export const uploadDocument = async (file: File): Promise<AnalysisResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post<AnalysisResult>(`${API_BASE_URL}/documents/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAnalysisStatus = async (documentId: string): Promise<AnalysisStatus> => {
  const response = await axios.get<AnalysisStatus>(`${API_BASE_URL}/analysis/${documentId}/status`);
  return response.data;
};

export const getAnalysisResult = async (documentId: string): Promise<AnalysisResult> => {
  const response = await axios.get<AnalysisResult>(`${API_BASE_URL}/analysis/${documentId}`);
  return response.data;
};
