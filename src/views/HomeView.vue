<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1>Welcome to My Blog</h1>
        <p>Where Ideas and Inspiration Come to Life</p>
        <router-link to="/about" class="btn-primary">Learn More About Us</router-link>
        <!-- Blog Posts Button -->
        <button v-if="isLoggedIn" @click="viewBlogPosts" class="btn-primary">View Blog Posts</button>
        <button v-else @click="showLoginWarning" class="btn-primary">View Blog Posts</button>
      </div>
    </section>

    <!-- Login Warning Modal -->
    <div v-if="showWarning" class="modal-overlay">
      <div class="modal-content">
        <h2>Access Denied</h2>
        <p>Please <router-link to="/login">log in</router-link> to view blog posts.</p>
        <button @click="showWarning = false">Close</button>
      </div>
    </div>

    <!-- Introduction Section -->
    <section class="intro-section">
      <div class="container">
        <h2>About the Blog</h2>
        <p>
          This blog is a place where creativity meets knowledge. Whether you're here to learn something new, find inspiration, or just enjoy a good read, you've come to the right place. Explore our articles, discover new ideas, and become part of our community.
        </p>
      </div>
    </section>

    <!-- Featured Articles Section -->
    <section class="featured-articles">
      <div class="container">
        <h2>Featured Articles</h2>
        <div class="articles-grid">
          <div class="article-card" v-for="article in articles" :key="article.id">
            <img :src="article.image" :alt="article.title" class="article-image" />
            <h3>{{ article.title }}</h3>
            <p>{{ article.excerpt }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action Section -->
    <section class="cta-section">
      <div class="container">
        <h2>Join Our Newsletter</h2>
        <p>Stay updated with our latest articles and special offers. Sign up for our newsletter today!</p>
        <form class="newsletter-form">
          <input type="email" placeholder="Enter your email" required />
          <button type="submit" class="btn-primary">Subscribe</button>
        </form>
      </div>
    </section>

    <!-- Footer Section -->
    <footer class="footer">
      <div class="container">
        <p>&copy; 2024 My Blog. All rights reserved.</p>
        <router-link to="/contact">Contact Us</router-link>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref } from 'vue';
import articleImage1 from '@/assets/article-image-1.jpg';
import articleImage2 from '@/assets/article-image-2.jpg';
import articleImage3 from '@/assets/article-image-3.jpg';

export default {
  data() {
    return {
      articles: [
        {
          id: 1,
          title: 'Exploring the Wonders of the World',
          excerpt: 'A journey through some of the most breathtaking places on Earth.',
          image: articleImage1
        },
        {
          id: 2,
          title: 'The Art of Mindful Living',
          excerpt: 'Tips and tricks on how to incorporate mindfulness into your daily life.',
          image: articleImage2
        },
        {
          id: 3,
          title: 'Tech Trends to Watch in 2024',
          excerpt: 'A look at the technologies that are shaping the future.',
          image: articleImage3
        }
      ],
      showWarning: false
    };
  },
  computed: {
    isLoggedIn() {
      // Assuming you have a method to check if the user is logged in
      return Boolean(localStorage.getItem('authToken'));
    }
  },
  methods: {
    viewBlogPosts() {
      this.$router.push('/posts');
    },
    showLoginWarning() {
      this.showWarning = true;
    }
  }
};

</script>




<style scoped>



html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden; 
  width: 100%; 
  height: 100%;
  
}

.home-container {
  max-width: 100vw; 
  overflow-x: hidden; 
  padding: 0; 
  margin: 0; 
}

.article-image {
  width: 10%; 
  height: auto; 
  display: block; 
  overflow-x: hidden;
  margin:0;
}

.home-image {
  width: 100%; 
  height: auto; 
  max-width: 100%;
  max-height: 900px; 
  object-fit: cover;
  display: block;
  margin: 0 auto;
  
}

.image-container {
  max-width: 100%; /* Ensure container does not exceed viewport width */
  overflow-x: hidden; /* Prevent horizontal scrolling */
  padding: 0; /* Remove padding to avoid extra space */
  margin: 10; 
 
 
}

h1, p {
  width:100%;
  margin: 20;
 
  overflow-x: hidden;
  max-width: 100%;
  line-height: 1.6;
  height: auto; /* Maintains aspect ratio */
  display: block;
  padding: 10px 0px;
  margin-left: 0px;
  

}



.home-view {
  font-family: 'Roboto', sans-serif;
  color: #262424;
  line-height: 1.6;
  max-width: 100%; /* Ensures image does not exceed container width */
  height: auto; /* Maintains aspect ratio */
  display: block;
  width:100%;
}

.hero-section {
  background: url('@/assets/hero-image.jpg') no-repeat center center/cover;
  color: white;
  text-align: center;
  padding: 150px 0px;
  margin-bottom: 10px;
  width:100%;
  
}

.hero-content h1 {
  width:100%; /* Ensures content doesn’t exceed the container width */
  text-align: center;
  padding: 20px;
  font-size: 3.5rem;
  margin-bottom: 0px;
  max-width: 100%;
}

.hero-content p {
  font-size: 1.25rem;
  margin-bottom: 30px;
}

.btn-primary {
  background-color: #266215c1;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  text-decoration: none;
  margin:20px;
  
}
.btn-primary button:hover {
  background-color: #7c4a7d;
  color: white;
}
.intro-section {
  background-color: #f9f9f9;
  padding: 60px 20px;
  text-align: center;
}

.intro-section h2 {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.intro-section p {
  font-size: 1.2rem;
  max-width: 800px;
  margin:  auto;
  
}

.featured-articles {
  max-width:100%;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 60px 20px;
  background-color: #f7f4f4;
}

.featured-articles h2 {
  text-align: center;
  margin-bottom: 40px;
  font-size: 2.5rem;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  
}

.article-card {
  max-width:100%;
  background-color: #eddcdc;
  border-radius: 10px;
  overflow: hidden;
  text-align: center;
  padding: 40px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.article-image {
width:100%;

}



.cta-section {
  background-color: #f02461a1;
  color: rgba(99, 31, 64, 0.989);
  text-align: center;
  padding: 60px 20px;
}

.cta-section h2 {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.cta-section p {
  font-size: 1.2rem;
  margin-bottom: 30px;
}

.newsletter-form {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.newsletter-form input[type="email"] {
  padding: 10px;
  border: none;
  border-radius: 5px;
  margin-right: 10px;
  width: 300px;
  font-size: 1rem;
}

.newsletter-form button {
  background-color: #333;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.footer {
  background-color: #1c1b1b;
  color: white;
  text-align: center;
  padding: 20px;
}

.footer a {
  color: #ff6f61;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #cddfeb;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(85, 9, 9, 0.2);
  width: 300px;
  text-align: center;
}

.modal-content h2 {
  margin: 0 0 10px;
}

.modal-content p {
  margin: 0 0 20px;
}

.modal-content button {
  margin: 10px;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Roboto', sans-serif;
}

.modal-content button:first-of-type {
  background-color: #c38383;
  color: white;
}

.modal-content button:first-of-type:hover {
  background-color: #c82333;
}
</style>

