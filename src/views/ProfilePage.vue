<template>
    <div class="profile-page">
      <div class="header">
        <h1>My Profile</h1>
        <router-link to="/posts">
          <button class="view-blog-posts-button">View Blog Posts</button>
        </router-link>
      </div>
  
      <div class="profile-sections">
        <section>
          <h2>My Posts</h2>
          <div v-if="loadingPosts">Loading posts...</div>
          <div v-else-if="posts.length === 0">No posts yet.</div>
          <ul v-else>
            <li v-for="post in posts" :key="post.id">
              <router-link :to="'/posts/' + post.slug">{{ post.title }}</router-link>
              <p>{{ post.excerpt }}</p>
              <p><small>{{ post.created_at_readable }}</small></p>
            </li>
          </ul>
        </section>
  
        <section>
          <h2>My Comments</h2>
          <div v-if="loadingComments">Loading comments...</div>
          <div v-else-if="comments.length === 0">No comments yet.</div>
          <ul v-else>
            <li v-for="comment in comments" :key="comment.id">
              <router-link :to="'/posts/' + comment.post.slug">{{ comment.post.title }}</router-link>
              <p>{{ comment.content }}</p>
              <p><small>{{ comment.created_at_readable }}</small></p>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue';
  import axios from 'axios';
  import type { Post, Comment, User } from '@/types';
  
  export default defineComponent({
    setup() {
      const posts = ref<Post[]>([]);
      const comments = ref<Comment[]>([]);
      const loadingPosts = ref(true);
      const loadingComments = ref(true);
      const user = ref<User | null>(null);
  
      const fetchCurrentUser = async () => {
        try {
          const response = await axios.get('https://interns-blog.nafistech.com/api/user', {
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
          });
          user.value = response.data;
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      };
  
      const fetchUserPosts = async () => {
        if (!user.value) return;
        try {
          const response = await axios.get(`https://interns-blog.nafistech.com/api/posts/?sort=desc&user_id=${user.value.id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
          });
          posts.value = response.data.data;
        } catch (error) {
          console.error('Error fetching posts:', error);
        } finally {
          loadingPosts.value = false;
        }
      };
  
      const fetchUserComments = async () => {
        if (!user.value) return;
        try {
          const response = await axios.get('https://interns-blog.nafistech.com/api/user/comments', {
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
          });
          comments.value = response.data.data;
        } catch (error) {
          console.error('Error fetching comments:', error);
        } finally {
          loadingComments.value = false;
        }
      };
  
      onMounted(async () => {
        await fetchCurrentUser();
        fetchUserPosts();
        fetchUserComments();
      });
  
      return {
        posts,
        comments,
        loadingPosts,
        loadingComments,
        user,
      };
    },
  });
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;500&display=swap');
  
  .profile-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 40px 20px;
    font-family: 'Open Sans', sans-serif;
  }
  
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30px;
  }
  
  h1 {
    font-family: 'Montserrat', sans-serif;
    font-size: 2.8em;
    color: #222;
  }
  
  .view-blog-posts-button {
    background-color: #33da7b;
    color: #fff;
    font-family: 'Montserrat', sans-serif;
    font-size: 1em;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .view-blog-posts-button:hover {
    background-color: #097434;
  }
  
  .profile-sections {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 40px;
  }
  
  /* Section styles */
  section {
    background-color: #fff;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
    flex: 1;
  }
  
  /* Post and Comment lists */
  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  
  li {
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 3px solid #eaeaea;
  }
  
  li:last-child {
    border-bottom: none;
  }
  
  a {
    font-size: 1.5em;
    font-family: 'Montserrat', sans-serif;
    font-weight: 600;
    color: #007bff;
    text-decoration: none;
  }
  
  a:hover {
    text-decoration: underline;
  }
  
  p {
    font-size: 1.2em;
    color: #b52323;
    margin: 10px 0;
    font-weight: bold;
  }
  
  small {
    font-size: 0.9em;
    color: #999;
  }
  
  .loading {
    font-size: 1.2em;
    color: #888;
    text-align: center;
  }
  
  li a {
    animation: fadeInUp 0.8s ease-out;
  }
  
  @keyframes fadeInUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    .profile-sections {
      flex-direction: column;
    }
  }
  </style>
  
  