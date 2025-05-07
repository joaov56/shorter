package controllers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"shorter/backend/domain"
)

// CreateShortURL creates a new short URL
func CreateShortURL(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		var url domain.URL
		err := json.NewDecoder(r.Body).Decode(&url)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		url.CreatedAt = time.Now()
		url.ShortURL = generateShortURL()

		userCollection := client.Database("urlshortener").Collection("users")
		var user domain.User

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
}

// GetLongURL retrieves the long URL for a given short URL
func GetLongURL(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		params := mux.Vars(r)
		shortURL := params["shortURL"]

		var url domain.URL
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
}

// GetUrlsByUserId retrieves all URLs for a given user
func GetUrlsByUserId(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		params := mux.Vars(r)
		email := params["email"]

		userCollection := client.Database("urlshortener").Collection("users")
		var user domain.User

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

		var urls []domain.URL
		for cursor.Next(context.Background()) {
			var url domain.URL
			if err := cursor.Decode(&url); err != nil {
				http.Error(w, "Error decoding URL", http.StatusInternalServerError)
				return
			}
			urls = append(urls, url)
		}

		json.NewEncoder(w).Encode(urls)
	}
}

// IncrementClickCount increments the click count for a URL
func IncrementClickCount(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
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

		var url domain.URL
		err := urlCollection.FindOne(ctx, bson.M{"short_url": shortURL}).Decode(&url)
		if err != nil {
			http.Error(w, "URL not found", http.StatusNotFound)
			return
		}

		// Create a new click record
		click := domain.Click{
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
}

// GetClickStats retrieves click statistics for a URL
func GetClickStats(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
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

		var clicks []domain.Click
		if err = cursor.All(ctx, &clicks); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(clicks)
	}
}

// GetUserClickStats retrieves click statistics for all URLs of a user
func GetUserClickStats(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		params := mux.Vars(r)
		email := params["email"]

		// First get the user
		userCollection := client.Database("urlshortener").Collection("users")
		var user domain.User
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

		var urls []domain.URL
		if err = urlCursor.All(context.Background(), &urls); err != nil {
			http.Error(w, "Error decoding URLs", http.StatusInternalServerError)
			return
		}

		// Prepare response structure
		type Link struct {
			URL domain.URL `json:"url"`
		}

		type DashboardResponse struct {
			Links          []Link     `json:"links"`
			MostClickedLink domain.URL `json:"mostClickedLink"`
			TotalClicks    int        `json:"totalClicks"`
			TotalLinks     int        `json:"totalLinks"`
		}

		response := DashboardResponse{
			Links:       make([]Link, len(urls)),
			TotalLinks:  len(urls),
			TotalClicks: 0,
		}

		// Find most clicked link and calculate total clicks
		var mostClickedURL domain.URL
		maxClicks := 0

		for i, url := range urls {
			response.Links[i] = Link{URL: url}
			response.TotalClicks += url.ClickCount

			if url.ClickCount > maxClicks {
				maxClicks = url.ClickCount
				mostClickedURL = url
			}
		}

		response.MostClickedLink = mostClickedURL

		json.NewEncoder(w).Encode(response)
	}
}

// generateShortURL generates a random short URL
func generateShortURL() string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	const length = 6
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(b)
} 