"use client";
import { useEffect, useRef, useState, FormEvent } from "react";
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Close";
import Head from "next/head";
import NewsCard from "@/components/NewsCard";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import SearchForm from "@/components/Search";

const Home = () => {
  const [news, setNews] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // This useEffect is responsible for scrolling the chat container to the bottom when news or loading state changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [news, loading]); // Only trigger this effect when news or loading changes

  const handleSearch = async (e: FormEvent<HTMLFormElement> | null) => {
    if (e) e.preventDefault();
    const searchTerm = query;
    if (!searchTerm.trim()) return;
  
    setSubmittedQuery(searchTerm);
    setQuery("");
    setNews("");
    setIsEditing(false);
    setLoading(true);
    setError("");

  
    try {
      const url = `/api/news?query=${encodeURIComponent(searchTerm)}`;
      const res = await fetch(url);
      const data = await res.json();
        
      if (res.ok) {
        // Safely access content from API response
        const content = data?.result?.content;
        if (content) {
          setNews(content); // Or however you want to structure/display it
        } else {
          setNews("");
          setError("No news content returned.");
        }
      } else {
        setError(data.error || "Failed to fetch news.");
      }
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("An error occurred while fetching the news.");
    } finally {
      setLoading(false);
    }
  };
  
  
  return (
    <>
      <Head>
        <title>Insightly | Chat News</title>
        <meta name="description" content="Fetch news in a chatbot style" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Top AppBar */}
      <AppBar
        position="static"
        sx={{ background: "linear-gradient(to right, #1976d2, #42a5f5)" }}
      >
        <Toolbar sx={{ justifyContent: "center" }}>
          <Typography variant="h5" fontWeight="bold">
            Insightly Chat News
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main UI */}
      <Container
        maxWidth="md"
        sx={{ py: 4, display: "flex", flexDirection: "column", gap: 4 }}
      >
        {/* Search Box */}
        <SearchForm
          query={query}
          setQuery={setQuery}
          handleSearch={handleSearch}
        />

        {/* Chat Box */}
        <Paper
          ref={chatContainerRef}
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 4,
            height: "70vh",
            overflowY: "auto",
            background: "#f5f5f5",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Submitted Query */}
          {submittedQuery && !loading && (
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Box
                sx={{
                  bgcolor: "#1976d2",
                  color: "white",
                  p: 2,
                  borderRadius: "20px 20px 0 20px",
                  maxWidth: "70%",
                  wordBreak: "break-word",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Typography variant="body1" sx={{ flexGrow: 1 }}>
                  {submittedQuery}
                </Typography>
                {!isEditing ? (
                  <IconButton
                    size="small"
                    sx={{ color: "white" }}
                    onClick={() => {
                      setQuery(submittedQuery);
                      setIsEditing(true);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                ) : (
                  <IconButton
                    size="small"
                    sx={{ color: "white" }}
                    onClick={() => {
                      setQuery("");
                      setIsEditing(false);
                    }}
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>
          )}

          {loading && <Loading />}
          {error && <ErrorMessage message={error} />}
          <NewsCard news={news} />
        </Paper>
      </Container>
    </>
  );
};

export default Home;
