import React from "react";
import { Typography, Button, Box } from "@mui/material";
import { OpenInNew } from "@mui/icons-material";
import { NewsCardProps } from "@/types/types";


const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  return (
    <Box>
      {news?.map((article, index) => (
        <Box key={index} sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
          <Box
            sx={{
              bgcolor: "#e0e0e0",
              p: 2,
              borderRadius: "20px 20px 20px 0",
              maxWidth: "70%",
              wordBreak: "break-word",
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              {article.title}
            </Typography>
            <Typography variant="body2">{article.snippet}</Typography>

            <Box sx={{ display: "flex", justifyContent: "end", alignItems: "center", mt: 1 }}>
              <Button
                variant="outlined"
                size="small"
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<OpenInNew />}
                sx={{
                  fontWeight: 600,
                  textTransform: "capitalize",
                  borderRadius: "20px",
                }}
              >
                View
              </Button>
              
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default NewsCard;
