import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import PropTypes from "prop-types";
import "./Upload.css"; // Optional: Add your custom styles
import Lottie from "lottie-react";
import uploadAnim from "../assets/upload.json";
import { Button, Typography, useMediaQuery, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export const UploadPopup = ({
  dropHeading,
  onDrop,
  onFileSelect,
  onClose,
  onConfirm,
  imagePreview,
}) => {
  const [preview, setPreview] = useState(imagePreview);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (files) => {
      if (files.length > 0) {
        setLoading(true);
        const file = files[0];
        onFileSelect(file);
        const url = URL.createObjectURL(file);
        setPreview(url);

        const img = new Image();
        img.onload = () => {
          setLoading(false);
        };
        img.src = url;

        onDrop(files);
      }
    },
  });

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      onFileSelect(file);
      const url = URL.createObjectURL(file);
      setPreview(url);

      const img = new Image();
      img.onload = () => {
        setLoading(false);
      };
      img.src = url;
    }
  };

  return (
    <div className="upload-popup">
      <div className="popup-header">
        <Typography
          variant="h4"
          style={{
            fontFamily: "Times New Roman",
            textAlign: "center",
            color: "#3BA99C",
            fontWeight: "700",
            letterSpacing: "0.5px",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
            background: "linear-gradient(135deg, #3BA99C 30%, #006D6F 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            borderRadius: "5px",
            display: "inline-block",
            margin: "0 auto", // Centers the Typography horizontally
          }}
          align="center"
        >
          {dropHeading}
        </Typography>
        <CloseIcon
          onClick={onClose}
          style={{
            cursor: "pointer",
            position: "absolute",
            top: isSmallScreen ? "10px" : "25px",
            right: isSmallScreen ? "10px" : "25px",
          }}
        />
      </div>

      <div className="dropzone-container" {...getRootProps()}>
        <input {...getInputProps()} onChange={handleFileInputChange} />
        <Lottie
          animationData={uploadAnim}
          loop
          style={{ width: "100%", height: "auto" }}
        />
        <p>Drag & drop an image here, or click to select one</p>
      </div>
      {loading && <p className="loading-text">Loading...</p>}
      {preview && !loading && (
        <div className="image-preview">
          <img
            src={preview}
            alt="Preview"
            style={{ width: "100px", height: "100px" }}
          />
        </div>
      )}

      <Button
        className="confirm-button"
        onClick={onConfirm}
        sx={{
          width: "100%",
          background: "#3BA99C",
          color: "white",
          height: "3rem",
        }}
      >
        <Typography
          style={{
            fontFamily: "Times New Roman",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          Confirm
        </Typography>
      </Button>
    </div>
  );
};

UploadPopup.propTypes = {
  dropHeading: PropTypes.string.isRequired,
  onDrop: PropTypes.func.isRequired,
  onFileSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};
