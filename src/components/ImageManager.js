import React, { useState, useEffect } from "react";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
  getMetadata,
} from "firebase/storage";
import { storage, auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  IconButton,
  Box,
  AppBar,
  Toolbar,
  Container,
  useMediaQuery,
  useTheme,
  Typography,
  Tooltip,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CopyAllIcon from "@mui/icons-material/CopyAll";
import UploadIcon from "@mui/icons-material/Upload";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LogoutIcon from "@mui/icons-material/Logout";
import Logo from "../utils/Logo";
import { useDispatch, useSelector } from "react-redux";
import { toggleDarkMode } from "../redux/actions"; // Ensure toggleDarkMode is handled correctly
import { DarkModeSwitch } from "../utils/DarkMode";
import { UploadPopup } from "./UploadPopUp";
import ConfirmationMsg from "../utils/Snacker";
import Lottie from "lottie-react";
import SearchIcon from "@mui/icons-material/Search";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import LoadingAni from "../assets/Loading.json";
import NoDataFound from "../assets/no_data_found.json";
import NoFiles from "../assets/NoFiles.json";

const ImageManager = () => {
  // State declarations
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [imageURLs, setImageURLs] = useState([]);
  const [user, setUser] = useState(null);
  const [imageToReplace, setImageToReplace] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [imageToUpload, setImageToUpload] = useState(null);
  const [isSearchOpen, setIsSearchIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isDarkMode = useSelector((state) => state.isDarkMode);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Side effects
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchImages();
      }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const fetchImages = async () => {
      if (!user) return;

      const imagesRef = ref(storage, `${user.uid}/images`);
      setLoading(true);
      setSearchLoading(true); // Start the search loader

      try {
        const result = await listAll(imagesRef);
        const urlPromises = result.items.map((item) => getDownloadURL(item));
        const metaDataPromises = result.items.map((item) => getMetadata(item));

        const [urls, metaData] = await Promise.all([
          Promise.all(urlPromises),
          Promise.all(metaDataPromises),
        ]);
        const filteredImages = urls
          .map((url, idx) => ({
            url,
            size: metaData[idx]?.size,
            name: decodeURIComponent(url.split("/").pop().split("?")[0]),
          }))
          .filter((image) =>
            image.name.toLowerCase().includes(searchQuery.toLowerCase())
          );

        setImageURLs(filteredImages);
        setNoResultsFound(filteredImages.length === 0 && searchQuery !== "");
      } catch (error) {
        console.error("Error fetching images: ", error);
      } finally {
        setLoading(false);
        setSearchLoading(false); // End the search loader
      }
    };

    fetchImages();
  }, [user, searchQuery]);

  useEffect(() => {
    const savedMode = localStorage.getItem("theme") === "dark";
    document.body.classList.toggle("dark-mode", savedMode);
  }, []);

  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode()); // Dispatching toggleDarkMode action
    const newDarkModeState = !isDarkMode;
    document.body.classList.toggle("dark-mode", newDarkModeState);
    localStorage.setItem("theme", newDarkModeState ? "dark" : "light");
    console.log(newDarkModeState, "darkMode", localStorage.getItem("theme"));
  };

  // Upload Image Handler
  const uploadImage = (imageNameToUse) => {
    if (imageToUpload == null) {
      console.error("No image selected for upload");
      return;
    }

    const imageRef = ref(storage, `${user.uid}/images/${imageNameToUse}`);
    setLoading(true);
    uploadBytes(imageRef, imageToUpload)
      .then(() => {
        console.log("Image uploaded successfully");
        fetchImages();
        setShowPopup(false);
      })
      .catch((error) => {
        console.error("Error uploading image: ", error);
      })
      .finally(() => setLoading(false));
  };

  // Replace Image Handler
  const replaceImage = (oldImageFullPath) => {
    if (!user || !newImage) return;

    const oldImageName = decodeURIComponent(
      oldImageFullPath.split("%2F").pop().split("?")[0]
    );
    const oldImageRef = ref(storage, `${user.uid}/images/${oldImageName}`);

    setLoading(true);

    deleteObject(oldImageRef)
      .then(() => {
        console.log(`Deleted old image: ${oldImageName}`);
        const newImageRef = ref(storage, `${user.uid}/images/${oldImageName}`);

        // Upload the new image with the same name
        return uploadBytes(newImageRef, newImage);
      })
      .then(() => {
        console.log("New image uploaded successfully with the same name.");
        fetchImages(); // Refresh the images after upload
        setNewImage(null); // Reset state
        setImageToReplace(null);
      })
      .catch((error) => {
        console.error("Error replacing image: ", error);
      })
      .finally(() => setLoading(false));
  };

  // Fetch Images Handler
  const fetchImages = () => {
    if (!user) return;
    const imagesRef = ref(storage, `${user.uid}/images`);

    setLoading(true);
    listAll(imagesRef)
      .then(async (result) => {
        const urlPromises = result.items.map((item) => getDownloadURL(item));
        const metaDataPromises = result.items.map((item) => getMetadata(item));

        const [urls, metaData] = await Promise.all([
          Promise.all(urlPromises),
          Promise.all(metaDataPromises),
        ]);

        const imageDetails = urls.map((url, idx) => ({
          url,
          size: metaData[idx]?.size,
        }));
        setImageURLs(imageDetails);
        setImageToReplace(null);
        setNoResultsFound(false);
      })
      .catch((error) => {
        console.error("Error fetching images: ", error);
      })
      .finally(() => setLoading(false));
  };

  // Delete Image Handler
  const deleteImage = (imageName) => {
    if (!user) return;

    const decodedImageName = decodeURIComponent(imageName.split("%2F").pop());
    const imageRef = ref(storage, `${user.uid}/images/${decodedImageName}`);

    setLoading(true);
    deleteObject(imageRef)
      .then(() => {
        showSnackbar("Image deleted successfully");
        fetchImages();
      })
      .catch((error) => {
        if (error.code === "storage/object-not-found") {
          console.error(
            "Error: The file does not exist at the specified location."
          );
        } else {
          console.error("Error deleting image: ", error);
        }
      })
      .finally(() => setLoading(false));
  };

  // Snackbar Handler
  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
    setTimeout(() => {
      setSnackbarOpen(false);
    }, 2000);
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <>
      <AppBar
        position="static"
        style={{
          backgroundColor: "#3BA99C",
          display: "flex",
        }}
      >
        <Toolbar>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
          >
            {/* Left side - Logo/Title */}
            <Box display="flex" alignItems="center">
              <Logo size="40px" />
            </Box>
            <Container>
              {isSearchOpen && !isSmallScreen && (
                <TextField
                  label="Search File"
                  variant="filled"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  // color="black"
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: "15px",
                      border: "1px solid #ffffff",
                      "&:before": {
                        display: "none",
                      },
                      "&:after": {
                        display: "none",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "white",
                      fontFamily: "Times New Roman",
                    },
                    "& .MuiInputBase-input": {
                      color: "white",
                      height: "auto",
                      fontSize: "16px",
                      fontFamily: "Times New Roman",
                    },
                    "& .MuiInputLabel-shrink": {
                      color: "lightgray",
                      fontFamily: "Times New Roman",
                    },
                    width: "100%",
                  }}
                />
              )}
            </Container>
            {/* Right side - Buttons */}
            <Box
              style={{
                display: "flex",
                gap: "2rem",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {isSearchOpen ? (
                <Tooltip>
                  <SearchOffIcon
                    style={{ fontSize: "34px", cursor: "pointer" }}
                    onClick={() => setIsSearchIsOpen(false)}
                  />
                </Tooltip>
              ) : (
                <Tooltip>
                  <SearchIcon
                    style={{ fontSize: "34px", cursor: "pointer" }}
                    onClick={() => setIsSearchIsOpen(true)}
                  />
                </Tooltip>
              )}
              <Tooltip title="switch theme">
                <DarkModeSwitch
                  checked={isDarkMode}
                  onChange={handleToggleDarkMode}
                  inputProps={{ "aria-label": "toggle dark mode" }}
                />
              </Tooltip>
              <LogoutIcon
                onClick={handleLogout}
                style={{ cursor: "pointer", fontSize: "35px" }}
              />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Container>
        {/* for mobile screen */}
        {isSearchOpen && isSmallScreen && (
          <TextField
            label="Search File"
            variant="filled"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              "& .MuiInputBase-root": {
                borderRadius: "15px",
                backgroundColor: "transparent",
                border: "3px solid var(--theme-border-color)",
                "&:before": {
                  display: "none",
                },
                "&:after": {
                  display: "none",
                },
              },
              "& .MuiInputLabel-root": {
                color: "var(--text-color)",
                fontFamily: "Times New Roman",
              },
              "& .MuiInputBase-input": {
                color: "var(--text-color)",
                fontFamily: "Times New Roman",
              },
              "& .MuiInputLabel-shrink": {
                color: "var(--theme-text-color )",
                fontFamily: "Times New Roman",
              },
              width: "100%",
              fontSize: "14px",
              marginTop: "12px",
            }}
          />
        )}
      </Container>
      <Container>
        <Button
          variant="contained"
          color="primary"
          startIcon={<UploadIcon style={{ fontSize: "32px" }} />}
          onClick={() => setShowPopup(true)}
          style={{
            width: "100%",
            height: "4rem",
            marginTop: "2rem",
            backgroundImage: "radial-gradient(circle, #3BA99C, #006D6F)",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            boxShadow: "0px 0px 1px 2px  #ffffff",
            borderRadius: "8px",
            color: "white",
          }}
        >
          <Typography variant="h6" style={{ fontFamily: "Times New Roman" }}>
            Upload File
          </Typography>
        </Button>
      </Container>

      <div style={{ padding: "20px" }}>
        {searchLoading || loading ? (
          <Container style={{ display: "flex", justifyContent: "center" }}>
            <Lottie
              animationData={LoadingAni}
              loop
              style={{
                width: isSmallScreen ? "100%" : "50%",
                height: isSmallScreen ? "100%" : "50%",
                alignSelf: "center",
              }}
            />
          </Container>
        ) : noResultsFound ? (
          <Container
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Lottie
              animationData={NoDataFound}
              loop
              style={{
                width: isSmallScreen ? "100%" : "30%",
                height: isSmallScreen ? "100%" : "30%",
                alignSelf: "center",
              }}
            />
            <Typography variant="h5" style={{ fontFamily: "Times New Roman" }}>
              No such file available
            </Typography>
          </Container>
        ) : imageURLs.length === 0 ? (
          <Container
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Lottie
              animationData={NoFiles}
              loop
              style={{
                width: isSmallScreen ? "100%" : "30%",
                height: isSmallScreen ? "100%" : "30%",
                alignSelf: "center",
              }}
            />
            <Typography variant="subtitle1" style={{ fontFamily: "Times New Roman" }} align="center">
              Looks like you haven't added any files yet. Click the 'Upload'
              button to get started! 😎
            </Typography>
          </Container>
        ) : (
          <List>
            {imageURLs.map((image, idx) => {
              const fileName = image.url.split("/").pop().split("?")[0];
              const splitedFileName = decodeURIComponent(
                fileName.split("%2F")[2]
              );
              const imageSize = image.size
                ? `${(image.size / (1024 * 1024)).toFixed(2)} MB`
                : "Unknown";
              return (
                <ListItem
                  key={idx}
                  secondaryAction={
                    <div style={{ display: "flex", gap: 3 }}>
                      <Tooltip title="Copy url">
                        <IconButton
                          edge="end"
                          aria-label="copy"
                          onClick={() => {
                            navigator.clipboard
                              .writeText(image.url)
                              .then(() => {
                                console.log("copy confirm");
                                showSnackbar("URL copied successfully");
                              });
                          }}
                          sx={{ color: "var(--icon-color)" }}
                        >
                          <CopyAllIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Image">
                        <IconButton
                          edge="end"
                          aria-label="view"
                          onClick={() =>
                            window.open(
                              image.url,
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                          sx={{ color: "var(--icon-color)" }}
                        >
                          <OpenInNewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Replace Image">
                        <IconButton
                          edge="end"
                          aria-label="replace"
                          onClick={() => setImageToReplace(image?.url)}
                          sx={{ color: "var(--icon-color)" }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete  Image">
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => {
                            deleteImage(fileName);
                          }}
                          sx={{ color: "var(--icon-color)" }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </div>
                  }
                >
                  <img
                    src={image.url}
                    alt={fileName}
                    style={{
                      width: "30px",
                      height: "30px",
                      marginRight: "30px",
                      borderRadius: "4px",
                      position: "relative",
                      border: "2px solid var(--border-color)",
                      boxShadow: "0 0 0 3px #3BA99C",
                      padding: "2px",
                    }}
                  />
                  <Tooltip
                    title={`File Size : ${imageSize}`}
                    style={{ cursor: "pointer" }}
                  >
                    <div>
                      <Typography
                        style={{
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          width: isSmallScreen ? "6rem" : "16rem",
                        }}
                      >
                        {splitedFileName}{" "}
                      </Typography>
                      <Typography
                        style={{
                          fontFamily: "Times New Roman",
                          fontSize: "10px",
                          fontWeight: "bold",
                        }}
                      >
                        {imageSize}
                      </Typography>
                    </div>
                  </Tooltip>
                </ListItem>
              );
            })}
          </List>
        )}

        <ConfirmationMsg
          open={snackbarOpen}
          message={snackbarMessage}
          onClose={() => setSnackbarOpen(false)}
        />

        {showPopup && (
          <Dialog open={showPopup} onClose={() => setShowPopup(false)}>
            <DialogTitle>Upload File</DialogTitle>
            <DialogContent>
              <UploadPopup
                dropHeading="Upload File"
                onClose={() => setShowPopup(false)}
                onDrop={(acceptedFiles) => {
                  setImageToUpload(acceptedFiles[0]);
                }}
                onFileSelect={(file) => setImageToUpload(file)}
                onConfirm={() => {
                  if (imageToUpload) {
                    uploadImage(imageToUpload.name);
                  }
                }}
              />
            </DialogContent>
          </Dialog>
        )}

        {imageToReplace && (
          <Dialog
            open={!!imageToReplace}
            onClose={() => {
              setImageToReplace(null);
            }}
          >
            <DialogTitle>Replace File</DialogTitle>
            <DialogContent>
              <UploadPopup
                dropHeading="Replace File"
                onDrop={(acceptedFiles) => setNewImage(acceptedFiles[0])}
                onFileSelect={(file) => setNewImage(file)}
                onClose={() => setImageToReplace(null)}
                onConfirm={() => {
                  if (newImage) {
                    replaceImage(imageToReplace);
                  }
                }}
                imagePreview={imageToReplace}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
};

export default ImageManager;
