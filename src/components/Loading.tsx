import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const Loading: React.FC = () => (
  <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
    <Box
      sx={{
        bgcolor: "#e0e0e0",
        p: 2,
        borderRadius: "20px 20px 20px 0",
        maxWidth: "60%",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Thinking...
      </Typography>
      <CircularProgress size={20} sx={{ mt: 1 }} />
    </Box>
  </Box>
);

export default Loading;
