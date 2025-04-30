import React from "react";
import { Box, Typography } from "@mui/material";

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
    <Box
      sx={{
        bgcolor: "#ffcdd2",
        p: 2,
        borderRadius: "20px 20px 20px 0",
        maxWidth: "70%",
        wordBreak: "break-word",
      }}
    >
      <Typography variant="body2" color="error">
        {message}
      </Typography>
    </Box>
  </Box>
);

export default ErrorMessage;
