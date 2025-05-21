const SupportTicket = require("../../models/supportTicket");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

// POST /api/customerSupport
const supportTicket = async (req, res) => {
  const { email, message } = req.body;

  if (!email || !message) {
    return res.status(400).json({ error: "Email and message are required." });
  }

  const ticketId = `TICKET-${uuidv4().slice(0, 8).toUpperCase()}`;

  try {
    // Save to DB
    const ticket = new SupportTicket({
      ticketId,
      email,
      message,
    });

    await ticket.save();

    // Mail transporter setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email to Admin
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "karthik18tech@gmail.com",
      subject: `New Support Ticket: ${ticketId}`,
      text: `Email: ${email}\nTicket ID: ${ticketId}\nMessage: ${message}`,
    });

    // Email to Customer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Your Support Ticket (${ticketId}) Received`,
      text: `Hi there,\n\nThank you for contacting us!\n\nYour ticket ID is: ${ticketId}.\n\We have received your message and our support team will get back to you shortly.\n\nMessage Summary:\n${message}\n\n- Machine Street Support Team`,
    });

    res.status(200).json({
      success: true,
      ticketId,
      message: `Ticket submitted: ${ticketId}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create support ticket" });
  }
};

module.exports = supportTicket;
