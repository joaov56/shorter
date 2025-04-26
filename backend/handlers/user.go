package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"shorter/backend/models"
)

func RegisterUser(w http.ResponseWriter, r *http.Request, client *mongo.Client) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		log.Printf("Error decoding request body: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Printf("Attempting to register user: %+v", user)

	user.CreatedAt = time.Now()

	collection := client.Database("urlshortener").Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Check if user already exists
	var existingUser models.User
	err = collection.FindOne(ctx, bson.M{"email": user.Email}).Decode(&existingUser)
	if err == nil {
		log.Printf("User already exists: %s", user.Email)
		http.Error(w, "User already exists", http.StatusConflict)
		return
	}

	result, err := collection.InsertOne(ctx, user)
	if err != nil {
		log.Printf("Error inserting user: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("User registered successfully with ID: %v", result.InsertedID)
	json.NewEncoder(w).Encode(user)
} 