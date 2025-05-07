package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"shorter/backend/infrastructure"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	infrastructure.ConnectDB()
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	router := mux.NewRouter()
	infrastructure.SetupRoutes(router, infrastructure.GetMongoClient())

	fmt.Println("Server is running on port", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
} 