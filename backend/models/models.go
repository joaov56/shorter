package models

import "time"

// URL represents a shortened URL in the system
type URL struct {
	ID         string    `json:"id" bson:"_id,omitempty"`
	LongURL    string    `json:"long_url" bson:"long_url"`
	ShortURL   string    `json:"short_url" bson:"short_url"`
	UserId     string    `json:"userId" bson:"user_id"`
	Email      string    `json:"email" bson:"email"`
	CreatedAt  time.Time `json:"created_at" bson:"created_at"`
	ClickCount int       `json:"click_count" bson:"click_count"`
}

// Click represents a click event on a shortened URL
type Click struct {
	ID        string    `json:"id" bson:"_id,omitempty"`
	ShortURL  string    `json:"short_url" bson:"short_url"`
	ClickedAt time.Time `json:"clicked_at" bson:"clicked_at"`
	IP        string    `json:"ip" bson:"ip"`
	UserAgent string    `json:"user_agent" bson:"user_agent"`
}

// User represents a user in the system
type User struct {
	ID        string    `json:"id" bson:"_id,omitempty"`
	Email     string    `json:"email" bson:"email"`
	Name      string    `json:"name" bson:"name"`
	CreatedAt time.Time `json:"created_at" bson:"created_at"`
} 