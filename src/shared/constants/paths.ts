export const paths = Object.freeze({
  root: "/",
  dashboard: "/dashboard",
  enrollmentLeads: "/enrollment-leads",
  whatsapp: "/whatsapp",
  reports: "/reports",

  auth: {
    root: "/auth",
    login: "/auth/login",
    loginLink: "/auth/login-link",
    signup: "/auth/signup",
    logout: "/logout",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },

  api: {
    acceptInvitation: (invitationId: string) =>
      `/api/accept-invitation/${invitationId}`,
  },
});
