import React from "react";
import { Typography, Box } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { NewsCardProps } from "@/types/types";

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
        <Box
          sx={{
            bgcolor: "#e0e0e0",
            p: 2,
            borderRadius: "20px 20px 20px 0",
            maxWidth: "70%",
            wordBreak: "break-word",
          }}
        >
          <Typography variant="body2" component="div">
            <ReactMarkdown>{news}</ReactMarkdown>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default NewsCard;
