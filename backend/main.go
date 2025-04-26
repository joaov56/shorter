package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"shorter/backend/handlers"
	"shorter/backend/models"
)

type URL struct {
	ID        string    `json:"id" bson:"_id,omitempty"`
	LongURL   string    `json:"long_url" bson:"long_url"`
	ShortURL  string    `json:"short_url" bson:"short_url"`
	UserId     string    `json:"userId" bson:"user_id"`
	Email     string    `json:"email" bson:"email"`
	CreatedAt time.Time `json:"created_at" bson:"created_at"`
}

var client *mongo.Client

func connectDB() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
	var err error
	client, err = mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal("Error connecting to MongoDB:", err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Error pinging MongoDB:", err)
	}
	fmt.Println("Connected to MongoDB!")

	// List all databases to verify connection
	databases, err := client.ListDatabaseNames(ctx, bson.M{})
	if err != nil {
		log.Fatal("Error listing databases:", err)
	}
	fmt.Println("Available databases:", databases)
}

func createShortURL(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var url URL
	err := json.NewDecoder(r.Body).Decode(&url)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	url.CreatedAt = time.Now()
	url.ShortURL = generateShortURL()

	userCollection := client.Database("urlshortener").Collection("users")
	var user models.User

	err = userCollection.FindOne(context.Background(), bson.M{"email": url.Email}).Decode(&user)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	url.UserId = user.ID

	collection := client.Database("urlshortener").Collection("urls")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err = collection.InsertOne(ctx, url)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(url)
}

func getLongURL(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	params := mux.Vars(r)
	shortURL := params["shortURL"]

	var url URL
	collection := client.Database("urlshortener").Collection("urls")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := collection.FindOne(ctx, bson.M{"short_url": shortURL}).Decode(&url)
	if err != nil {
		http.Error(w, "URL not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(url)
}

func generateShortURL() string {
	return fmt.Sprintf("%x", time.Now().UnixNano())[:8]
}

func main() {
	connectDB()
	router := mux.NewRouter()

	router.HandleFunc("/api/url", createShortURL).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/url/{shortURL}", getLongURL).Methods("GET")
	router.HandleFunc("/api/users", func(w http.ResponseWriter, r *http.Request) {
		handlers.RegisterUser(w, r, client)
	}).Methods("POST", "OPTIONS")

	fmt.Println("Server is running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", router))
} 