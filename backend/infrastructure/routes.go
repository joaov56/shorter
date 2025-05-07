package infrastructure

import (
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/mongo"
	"shorter/backend/handlers"
)

func SetupRoutes(router *mux.Router, client *mongo.Client) {
	router.HandleFunc("/api/url", handlers.CreateShortURL(client)).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/url/getUrlsByUserId/{email}", handlers.GetUrlsByUserId(client)).Methods("GET")
	router.HandleFunc("/api/url/{shortURL}", handlers.GetLongURL(client)).Methods("GET")
	router.HandleFunc("/api/url/{shortURL}/click", handlers.IncrementClickCount(client)).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/url/{shortURL}/stats", handlers.GetClickStats(client)).Methods("GET")
	
	router.HandleFunc("/api/dashboard/{email}", handlers.GetUserClickStats(client)).Methods("GET")
	
	router.HandleFunc("/api/users", func(w http.ResponseWriter, r *http.Request) {
		handlers.RegisterUser(w, r, client)
	}).Methods("POST", "OPTIONS")
} 