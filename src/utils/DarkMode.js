import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";

export const DarkModeSwitch = styled(Switch)(({ theme }) => ({
  width: 60,
  height: 34,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(6px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(26px)",
      "& .MuiSwitch-thumb:before": {
        content: '"🌙"',
        position: "absolute",
        fontSize: "1.5rem",
        textAlign: "center",
        lineHeight: "22px",
        left: "2px",
        top: "3px",
      },
      "& + .MuiSwitch-track": {
        backgroundColor: "#868686",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: "#fff",
    width: 32,
    height: 32,
    borderRadius: 20,
    position: "relative",
    "&:before": {
      content: '"☀️"',
      position: "absolute",
      fontSize: "1.5rem",
      textAlign: "center",
      lineHeight: "22px",
      left: "3px",
      top: "4px",
    },
  },
  "& .MuiSwitch-track": {
    borderRadius: 20,
    backgroundColor: "#f4f4f4",
    opacity: 1,
  },
}));
