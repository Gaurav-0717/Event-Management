import api from "./api";

export const downloadEventDossier = async (eventId) => {
  const response = await api.get(`/events/${eventId}/dossier`, {
    responseType: "blob",
    timeout: 60000,
  });

  const blob = new Blob([response.data], {
    type: "application/pdf",
  });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;

  link.download = "EventWise-Event-Dossier.pdf";

  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
};
