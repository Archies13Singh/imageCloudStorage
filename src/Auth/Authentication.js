import React, { useEffect, useState } from "react";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  linkWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
} from "firebase/auth";
import { VisibilityOff, RemoveRedEye } from "@mui/icons-material";
import { auth } from "../firebase"; // Adjust the path as needed
import { useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Lottie from "lottie-react";
import animationData from "../assets/signIn.json"; // Adjust the path as needed
import "./Auth.css";
import "../App.css";
import Logo from "../utils/Logo";
import ConfirmationMsg from "../utils/Snacker";

const Authentication = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailPlaceHolder, setEmailPlaceHolder] = useState("Email");
  const [passwordPlaceHolder, setPassPlaceHolder] = useState("Password");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordDialogOpen, setForgotPasswordDialogOpen] =
    useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        navigate("/image-manager");
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser, navigate]);

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
    setTimeout(() => {
      setSnackbarOpen(false);
    }, 2000);
  };

  useEffect(() => {
    const createStars = () => {
      const container = document.querySelector(".background-container");
      const numStars = 100;
      const existingStars = container.querySelectorAll(".star");
      existingStars.forEach((star) => star.remove());

      for (let i = 0; i < numStars; i++) {
        const star = document.createElement("div");
        star.className =
          "star " +
          (Math.random() > 0.8
            ? "large"
            : Math.random() > 0.5
            ? "medium"
            : "small");
        star.style.top = Math.random() * 100 + "vh";
        star.style.left = Math.random() * 100 + "vw";
        star.style.animationDuration = `${Math.random() * 30 + 10}s`;
        container.appendChild(star);
      }
    };

    createStars();
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(String(email).toLowerCase())) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
    if (passwordError) {
      setPasswordError(""); // Clear error if user starts typing
    }
  };

  const handleAuth = async () => {
    if (!validateEmail(email) || !validatePassword(password)) {
      return;
    }

    try {
      await setPersistence(auth, browserLocalPersistence);

      if (isSignUp) {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
          if (error.code === "auth/email-already-in-use") {
            setEmailError("Email already in use.");
          } else {
            setEmailError("An unexpected error occurred.");
          }
          return;
        }
      } else {
        try {
          await signInWithEmailAndPassword(auth, email, password);
          setUser(auth.currentUser);
          navigate("/image-manager");
        } catch (error) {
          if (error.code === "auth/invalid-credential") {
            setEmailError("Invalid Credentials.");
          } else {
            setEmailError("An unexpected error occurred.");
          }
          return;
        }
      }

      if (auth.currentUser) {
        setUser(auth.currentUser);
        navigate("/image-manager");
      }
    } catch (error) {
      console.error("Authentication error:", error.message, error.code);
      setEmailError("An unexpected error occurred.");
    }
  };

  const handleGoogleAuth = async (isSignUpMode) => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (isSignUpMode) {
        const credential = EmailAuthProvider.credential(email, password);
        await linkWithCredential(user, credential);
      } else {
        setUser(user);
        navigate("/image-manager");
      }
    } catch (error) {
      console.error("Google Auth error:", error.message, error.code);
      alert("An error occurred during Google authentication.");
    }
  };

  const handleForgotPasswordOpen = () => {
    setForgotPasswordDialogOpen(true);
  };

  const handleForgotPasswordClose = () => {
    setForgotPasswordDialogOpen(false);
  };

  const handleForgotPasswordSubmit = async () => {
    if (!validateEmail(forgotPasswordEmail)) {
      return;
    }

    try {
      await sendPasswordResetEmail(auth, forgotPasswordEmail);
      showSnackbar("Password reset email sent. Please check your inbox.");
      handleForgotPasswordClose();
    } catch (error) {
      console.error("Password Reset error:", error.message, error.code);
      showSnackbar("An error occurred while sending the password reset email.");
    }
  };

  return (
    <div className="background-container">
      <div className="shape circle1"></div>
      <div className="shape circle2"></div>
      <div className="shape circle3"></div>

      <div className="shape star star1"></div>
      <div className="shape star star2"></div>
      <div className="shape star star3"></div>
      <div className="auth-wrapper">
        {/* left side of login page */}

        <div className="auth-form">
          {isSmallScreen && (
            <Container>
              <Logo size="30px" />
            </Container>
          )}
          <Typography
            variant="h4"
            gutterBottom
            style={{
              color: "aliceblue",
              textAlign: "center",
              fontFamily: "'Times New Roman', Times, serif",
            }}
          >
            {isSignUp ? "Sign Up" : "Login"}
          </Typography>
          <div>
            <TextField
              label={email === "" && emailPlaceHolder}
              onFocus={() => setEmailPlaceHolder("")}
              onBlur={() => setEmailPlaceHolder("Email")}
              type="email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={handleEmailChange}
              error={!!emailError}
              className="textField no-border"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            />
            <div className="password-container">
              <TextField
                label={password === "" && passwordPlaceHolder}
                onFocus={() => setPassPlaceHolder("")}
                onBlur={() => setPassPlaceHolder("Password")}
                type={showPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                margin="normal"
                value={password}
                onChange={handlePasswordChange}
                error={!!passwordError}
                className="password-input textField no-border"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
              />
              {showPassword ? (
                <RemoveRedEye
                  onClick={togglePasswordVisibility}
                  className="password-eye-icon"
                  alt="Hide Password"
                />
              ) : (
                <VisibilityOff
                  onClick={togglePasswordVisibility}
                  className="password-eye-icon"
                  alt="Show Password"
                />
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <Typography
                onClick={handleForgotPasswordOpen}
                style={{
                  display: "inline-block",
                  marginBottom: "12px",
                  fontFamily: "Times New Roman",
                  fontSize: "20px",
                }}
                color="#3BA99C"
              >
                Forgot Password?
              </Typography>
            </div>
          </div>
          <Typography color="red" align="center">
            {emailError}
          </Typography>
          <div className="submit-section">
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={handleAuth}
              style={{ padding: "0.7rem", border: "2px solid #3BA99C" }}
            >
              <Typography
                className="submit-button-text"
                style={{ fontFamily: "Times New Roman", fontSize: "20px" }}
              >
                {isSignUp ? "Sign Up" : "Sign In"}
              </Typography>
            </Button>
            <div className="divider-container">
              <hr className="divider" />
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Typography
                className="divider-text"
                style={{ fontFamily: "Times New Roman", fontSize: "16px" }}
              >
                OR
              </Typography>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <hr className="divider" />
            </div>
            <img
              src="https://firebasestorage.googleapis.com/v0/b/imagestorage-6c529.appspot.com/o/HFTkj4OSb3YxnwMBg9OVQxzTrMK2%2Fimages%2Fgoogle.png?alt=media&token=4a88f2e7-d3a4-48aa-bf9d-273361141888"
              alt={isSignUp ? "Sign Up with Google" : "Sign In with Google"}
              className="google-signin-img"
              onClick={() => handleGoogleAuth(isSignUp)}
            />
          </div>
          <div className="toggle-signup-login">
            <Typography
              className="toggle-signup-login-text"
              style={{ fontFamily: "Times New Roman", fontSize: "20px" }}
            >
              {isSignUp ? "Already a user ?" : "New User ? "}
            </Typography>
            <Typography
              className="toggle-signup-login-link"
              onClick={() => setIsSignUp(!isSignUp)}
              style={{ fontFamily: "Times New Roman", fontSize: "20px" }}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </Typography>
          </div>
        </div>
        {/* Right Side of login Page */}
        <div className="lottie-container">
          <Logo size="80px" />
          <Lottie
            animationData={animationData}
            loop
            style={{ width: "100%", height: "auto" }}
          />
        </div>

        <Dialog
          open={forgotPasswordDialogOpen}
          onClose={handleForgotPasswordClose}
          PaperProps={{
            style: {
              backgroundColor: "#f5f5f5", // Background color of the dialog
              borderRadius: "8px",

              border: "1px solid black",
              boxShadow: "0px 0px 4px 1px #3BA99C",
            },
          }}
        >
          <DialogTitle style={{ color: "#3BA99C", fontWeight: "700" }}>
            Forgot Password
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Enter your email"
              type="email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              error={!!emailError}
            />
            <Typography color="red" align="center">
              {emailError}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleForgotPasswordClose} color="#3BA99C">
              Cancel
            </Button>
            <Button onClick={handleForgotPasswordSubmit} color="#3BA99C">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </div>

      <ConfirmationMsg
        open={snackbarOpen}
        message={snackbarMessage}
        onClose={() => setSnackbarOpen(false)}
      />
    </div>
  );
};

export default Authentication;
