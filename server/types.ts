// types.ts
export interface RegisterBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export interface LoginBody {
  email: string;
  password: string;
  role: string;
}

export interface GenerateIdeaBody {
  idea: string;
}

export interface JwtUserPayload {
  id: number;
  userId: number;
  email: string;
  role: string;
}

export interface Message {
  id?: number;
  studentEmail: string;
  sender: string;
  content: string;
  createdAt?: string;
}


