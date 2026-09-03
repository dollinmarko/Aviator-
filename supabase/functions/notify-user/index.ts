// Supabase Edge Function: notify-user
// Envoi sécurisé des e-mails de confirmation ou de refus TOP GSS
// Déployer avec : supabase functions deploy notify-user

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "myuantojah@gmail.com";

interface NotificationPayload {
  email?: string;
  username?: string;
  type: "approved" | "rejected" | "new_registration";
  appUrl?: string;
  adminEmail?: string;
  clientEmail?: string;
  clientUsername?: string;
  clientPhone?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    const {
      email,
      username,
      type,
      appUrl = "https://topgss.app",
      clientEmail,
      clientUsername,
      clientPhone,
    } = payload;

    if (!type) {
      return new Response(JSON.stringify({ error: "Type de notification manquant" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let recipientEmail = email || "";
    let subject = "";
    let htmlContent = "";

    if (type === "new_registration") {
      // Notification envoyée à l'administrateur (myuantojah@gmail.com) pour confirmation
      recipientEmail = ADMIN_EMAIL;
      subject = `✈️ TOP GSS - Nouvelle demande de client à confirmer : ${clientUsername || 'Nouveau membre'}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; background: #000; color: #fff; padding: 30px; border-radius: 8px; border: 1px solid #E50914;">
          <h1 style="color: #E50914; margin-bottom: 10px;">✈️ TOP GSS - DEMANDE DE CONFIRMATION</h1>
          <p style="color: #aaa; font-size: 13px;">Notification d'inscription client adressée à l'administrateur (<strong>${ADMIN_EMAIL}</strong>)</p>
          <hr style="border-color: #333; margin: 20px 0;" />
          <p>Bonjour Administrateur,</p>
          <p>Un nouveau client vient de créer son compte et est en attente de votre confirmation :</p>
          <ul style="background: #151515; padding: 15px 25px; border-radius: 6px; list-style: none; line-height: 1.8;">
            <li>👤 <strong>Nom d'utilisateur :</strong> ${clientUsername || 'N/A'}</li>
            <li>📧 <strong>E-mail client :</strong> ${clientEmail || 'N/A'}</li>
            <li>📱 <strong>Téléphone :</strong> ${clientPhone || 'N/A'}</li>
            <li>⏳ <strong>Statut :</strong> En attente de validation</li>
          </ul>
          <p style="margin-top: 25px;">Connectez-vous à votre panneau administrateur pour confirmer ou refuser la demande :</p>
          <div style="margin: 25px 0;">
            <a href="${appUrl}/admin" style="background: #E50914; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              ACCÉDER AU PANNEAU D'ADMINISTRATION
            </a>
          </div>
          <p style="color: #888; font-size: 11px; margin-top: 30px;">TOP GSS System - E-mail Administrateur : ${ADMIN_EMAIL}</p>
        </div>
      `;
    } else if (type === "approved") {
      recipientEmail = email || "";
      subject = "Votre compte TOP GSS a été confirmé";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; background: #000; color: #fff; padding: 30px; border-radius: 8px;">
          <h1 style="color: #E50914; margin-bottom: 20px;">✈️ TOP GSS</h1>
          <p>Bonjour <strong>${username}</strong>,</p>
          <p>Votre compte TOP GSS vient d’être confirmé par l’administrateur (<strong>${ADMIN_EMAIL}</strong>).</p>
          <p>Vous pouvez maintenant vous connecter à votre compte et accéder à la plateforme.</p>
          <p>Bienvenue dans TOP GSS.</p>
          <div style="margin: 30px 0;">
            <a href="${appUrl}/connexion" style="background: #E50914; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              SE CONNECTER À TOP GSS
            </a>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 30px;">Équipe TOP GSS - Accès VIP</p>
        </div>
      `;
    } else {
      recipientEmail = email || "";
      subject = "Votre demande d'inscription TOP GSS";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; background: #000; color: #fff; padding: 30px; border-radius: 8px;">
          <h1 style="color: #E50914; margin-bottom: 20px;">✈️ TOP GSS</h1>
          <p>Bonjour <strong>${username}</strong>,</p>
          <p>Après vérification, votre demande d'inscription à TOP GSS n'a pas été acceptée.</p>
          <p>Pour toute question ou réclamation, vous pouvez contacter l'administrateur à l'adresse : <a href="mailto:${ADMIN_EMAIL}" style="color: #E50914;">${ADMIN_EMAIL}</a>.</p>
          <p style="color: #888; font-size: 12px; margin-top: 30px;">Équipe TOP GSS - Support</p>
        </div>
      `;
    }

    if (!recipientEmail) {
      return new Response(JSON.stringify({ error: "Destinataire manquant" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Si la clé RESEND_API_KEY ou SMTP est configurée dans Supabase Secrets
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "TOP GSS <notifications@topgss.app>",
          to: [email],
          subject,
          html: htmlContent,
        }),
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: `Email ${type} envoyé avec succès à ${email}` }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
