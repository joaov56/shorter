package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"shorter/backend/infrastructure/database"
	httphandler "shorter/backend/infrastructure/http"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	database.ConnectDB()
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	router := mux.NewRouter()
	httphandler.SetupRoutes(router, database.GetMongoClient())

	fmt.Println("Server is running on port", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
} 