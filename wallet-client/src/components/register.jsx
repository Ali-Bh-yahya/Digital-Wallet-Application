// src/components/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/AuthModal.css";

export default function Register({ onClose }) {
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    phone: "", 
    idNumber: "" 
  });
  const [idCardImage, setIdCardImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [err, setErr] = useState(null);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErr("File size must be less than 5MB");
        return;
      }
      setIdCardImage(file);
      setImagePreview(URL.createObjectURL(file));
      setErr(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);

    if (!idCardImage) {
      setErr("Please upload your ID card image");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("phone", form.phone);
      formData.append("idNumber", form.idNumber);
      formData.append("idCardImage", idCardImage);

      await auth.register(formData);
      alert("Registration successful! Wait for admin approval before using the app.");
      onClose?.();
      navigate("/");
    } catch (error) {
      setErr(error.response?.data?.error || error.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <input 
            name="name" 
            type="text"
            placeholder="Full Name" 
            value={form.name} 
            onChange={handleChange} 
            required 
          />
          <input 
            name="email" 
            type="email" 
            placeholder="Email Address" 
            value={form.email} 
            onChange={handleChange} 
            required 
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            value={form.password} 
            onChange={handleChange} 
            required 
          />
          <input 
            name="phone" 
            type="tel"
            placeholder="Phone Number" 
            value={form.phone} 
            onChange={handleChange} 
            required 
          />
          <input 
            name="idNumber" 
            type="text"
            placeholder="ID Number" 
            value={form.idNumber} 
            onChange={handleChange} 
            required 
          />
          
          <div className="file-upload-section">
            <label>Upload ID Card Image *</label>
            <input 
              type="file" 
              accept="image/*,application/pdf"
              onChange={handleImageChange}
              required
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="ID Preview" />
              </div>
            )}
          </div>

          {err && <div className="error-message">{err}</div>}
          <button className="btn" type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}