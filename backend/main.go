package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
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
	ClickCount int      `json:"click_count" bson:"click_count"`
}

type Click struct {
	ID        string    `json:"id" bson:"_id,omitempty"`
	ShortURL  string    `json:"short_url" bson:"short_url"`
	ClickedAt time.Time `json:"clicked_at" bson:"clicked_at"`
	IP        string    `json:"ip" bson:"ip"`
	UserAgent string    `json:"user_agent" bson:"user_agent"`
}

var client *mongo.Client

func connectDB() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	mongodbURI := os.Getenv("MONGODB_URI")
	if mongodbURI == "" {
		mongodbURI = "mongodb://localhost:27017" // valor padrão
	}
	
	clientOptions := options.Client().ApplyURI(mongodbURI)
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

func getUrlsByUserId(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	params := mux.Vars(r)
	email := params["email"]

	userCollection := client.Database("urlshortener").Collection("users")
	var user models.User

	err := userCollection.FindOne(context.Background(), bson.M{"email": email}).Decode(&user)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	collection := client.Database("urlshortener").Collection("urls")

	cursor, err := collection.Find(context.Background(), bson.M{"user_id": user.ID})
	if err != nil {
		http.Error(w, "Error fetching URLs", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.Background())

	var urls []URL
	for cursor.Next(context.Background()) {
		var url URL
		if err := cursor.Decode(&url); err != nil {
			http.Error(w, "Error decoding URL", http.StatusInternalServerError)
			return
		}
		urls = append(urls, url)
	}

	json.NewEncoder(w).Encode(urls)	
}

func incrementClickCount(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	params := mux.Vars(r)
	shortURL := params["shortURL"]

	// First, verify the URL exists
	urlCollection := client.Database("urlshortener").Collection("urls")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var url URL
	err := urlCollection.FindOne(ctx, bson.M{"short_url": shortURL}).Decode(&url)
	if err != nil {
		http.Error(w, "URL not found", http.StatusNotFound)
		return
	}

	// Create a new click record
	click := Click{
		ShortURL:  shortURL,
		ClickedAt: time.Now(),
		IP:        r.RemoteAddr,
		UserAgent: r.UserAgent(),
	}

	// Save the click to the clicks collection
	clicksCollection := client.Database("urlshortener").Collection("clicks")
	_, err = clicksCollection.InsertOne(ctx, click)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update the click count in the URL document
	update := bson.M{
		"$inc": bson.M{"click_count": 1},
	}

	result, err := urlCollection.UpdateOne(
		ctx,
		bson.M{"short_url": shortURL},
		update,
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "URL not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

// Add a new endpoint to get click statistics
func getClickStats(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	params := mux.Vars(r)
	shortURL := params["shortURL"]

	clicksCollection := client.Database("urlshortener").Collection("clicks")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := clicksCollection.Find(ctx, bson.M{"short_url": shortURL})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var clicks []Click
	if err = cursor.All(ctx, &clicks); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(clicks)
}

// Add a new endpoint to get click statistics for all user's URLs
func getUserClickStats(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	params := mux.Vars(r)
	email := params["email"]

	// First get the user
	userCollection := client.Database("urlshortener").Collection("users")
	var user models.User
	err := userCollection.FindOne(context.Background(), bson.M{"email": email}).Decode(&user)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Get all URLs for this user
	urlCollection := client.Database("urlshortener").Collection("urls")
	urlCursor, err := urlCollection.Find(context.Background(), bson.M{"user_id": user.ID})
	if err != nil {
		http.Error(w, "Error fetching URLs", http.StatusInternalServerError)
		return
	}
	defer urlCursor.Close(context.Background())

	var urls []URL
	if err = urlCursor.All(context.Background(), &urls); err != nil {
		http.Error(w, "Error decoding URLs", http.StatusInternalServerError)
		return
	}

	// Get click statistics for each URL
	clicksCollection := client.Database("urlshortener").Collection("clicks")
	type URLWithStats struct {
		URL    URL     `json:"url"`
		Stats  []Click `json:"stats"`
	}

	var urlsWithStats []URLWithStats
	for _, url := range urls {
		clickCursor, err := clicksCollection.Find(context.Background(), bson.M{"short_url": url.ShortURL})
		if err != nil {
			continue
		}

		var clicks []Click
		if err = clickCursor.All(context.Background(), &clicks); err != nil {
			continue
		}

		urlsWithStats = append(urlsWithStats, URLWithStats{
			URL:   url,
			Stats: clicks,
		})
	}

	// Calculate total clicks and most clicked link
	totalClicks := 0
	var mostClickedLink URL
	maxClicks := 0

	for _, urlWithStats := range urlsWithStats {
		clicks := len(urlWithStats.Stats)
		totalClicks += clicks
		if clicks > maxClicks {
			maxClicks = clicks
			mostClickedLink = urlWithStats.URL
		}
	}

	response := struct {
		Links          []URLWithStats `json:"links"`
		TotalClicks    int            `json:"totalClicks"`
		TotalLinks     int            `json:"totalLinks"`
		MostClickedLink URL           `json:"mostClickedLink"`
	}{
		Links:          urlsWithStats,
		TotalClicks:    totalClicks,
		TotalLinks:     len(urls),
		MostClickedLink: mostClickedLink,
	}

	json.NewEncoder(w).Encode(response)
}

func generateShortURL() string {
	return fmt.Sprintf("%x", time.Now().UnixNano())[:8]
}

func main() {
	// Carrega as variáveis de ambiente do arquivo .env
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	connectDB()
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // valor padrão
	}

	router := mux.NewRouter()

	router.HandleFunc("/api/url", createShortURL).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/url/getUrlsByUserId/{email}", getUrlsByUserId).Methods("GET")
	router.HandleFunc("/api/url/{shortURL}", getLongURL).Methods("GET")
	router.HandleFunc("/api/url/{shortURL}/click", incrementClickCount).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/url/{shortURL}/stats", getClickStats).Methods("GET")
	router.HandleFunc("/api/dashboard/{email}", getUserClickStats).Methods("GET")
	router.HandleFunc("/api/users", func(w http.ResponseWriter, r *http.Request) {
		handlers.RegisterUser(w, r, client)
	}).Methods("POST", "OPTIONS")

	fmt.Println("Server is running on port", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
} 