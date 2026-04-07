import { toast } from "sonner";

export function notifySuccess(message: string, description?: string) {
  toast.success(message, { description });
}

export function notifyError(message: string, description?: string) {
  toast.error(message, { description });
}

export function notifyWarning(message: string, description?: string) {
  toast.warning(message, { description });
}

export function notifyInfo(message: string, description?: string) {
  toast.info(message, { description });
}
