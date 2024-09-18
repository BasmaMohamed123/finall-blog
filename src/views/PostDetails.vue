<template>
  <div v-if="post" class="post-details">
    <h1 class="post-title">{{ post.title }}</h1>
    <p class="post-content">{{ post.content }}</p>

    <div v-if="post.image" class="post-image">
      <img :src="post.image" alt="Post Image" />
    </div>

    <p class="post-author" v-if="post.user">Written by: {{ post.user.name }}</p>

    <!-- Like Section -->
    <div class="like-container">
      <button @click="toggleLike" :class="{ liked: post.liked }">
        <span class="heart">{{ post.liked ? '❤️' : '🤍' }}</span> Like
      </button>
      <p class="likes-count">
        {{ post.likes_count }} Likes
        <button @click="toggleUserList" class="show-users-button">
          {{ showUserList ? 'Hide' : 'Show' }} Likes
        </button>
      </p>
    </div>

    <div v-if="showUserList" class="liked-users">
      <p>Liked by:</p>
      <ul>
        <li v-for="user in post.likes" :key="user.id">{{ user.name }}</li>
      </ul>
    </div>

    <!-- Comment Form -->
    <div class="comment-form">
      <textarea v-model="newComment" placeholder="Add a comment..." rows="4" class="comment-textarea"></textarea>
      <button @click="submitComment" class="button submit-button">Submit</button>
    </div>

    <!-- Comments Section -->
    <div class="comments-section" v-if="comments.length">
      <h2>Comments</h2>
      <div v-for="comment in sortedComments" :key="comment.id" class="comment">
        <p class="comment-content">
          <template v-if="editingComment && editingComment.id === comment.id">
            <textarea v-model="editedCommentContent" rows="4" class="comment-textarea"></textarea>
            <button @click="updateComment" class="button submit-button">Save</button>
            <button @click="cancelEdit" class="button cancel-button">Cancel</button>
          </template>
          <template v-else>
            {{ comment.content }}
          </template>
        </p>

        <p class="comment-author">By: {{ comment.user.name }}</p>

        <!-- Edit/Delete Comment -->
        <div class="comment-actions">
          <button v-if="isCommentOwner(comment)" @click="editComment(comment)" class="button edit-button">Edit</button>
          <button v-if="isCommentOwner(comment) || isPostOwner" @click="deleteComment(comment.id)" class="button delete-button">Delete</button>
        </div>

        <!-- Reply Section -->
        <button @click="toggleReplyForm(comment.id)" class="button reply-button">Reply</button>
        <div v-if="comment.showReplyForm" class="reply-form">
          <textarea v-model="replyContent[comment.id]" placeholder="Write a reply..." rows="2" class="comment-textarea"></textarea>
          <button @click="submitReply(comment.id)" class="button submit-button">Submit Reply</button>
        </div>

        <!-- Show Replies Button -->
        <button v-if="comment.children && comment.children.length" @click="toggleReplies(comment)" class="button show-replies-button">
          {{ comment.showReplies ? 'Hide Replies' : 'Show Replies' }} ({{ comment.children.length }})
        </button>

        <!-- Replies (Nested) -->
        <div v-if="comment.showReplies" class="replies">
          <div v-for="reply in comment.children" :key="reply.id" class="reply">
            <!-- {{ comment.children }} -->
            <p class="reply-content">
              <template v-if="editingReply && editingReply.id === reply.id">
                <textarea v-model="editedReplyContent" rows="2" class="comment-textarea"></textarea>
                <button @click="updateReply" class="button submit-button">Save</button>
                <button @click="cancelEditReply" class="button cancel-button">Cancel</button>
              </template>
              <template v-else>
                {{ reply.content }}
              </template>

            </p>
            <p class="reply-author">By: {{ reply.user?.name }}</p>

            <!-- Edit/Delete Reply -->
            <div class="reply-actions">
              <button v-if="isReplyOwner(reply)" @click="editReply(reply)" class="button edit-button">Edit</button>
              <button v-if="isReplyOwner(reply) || isPostOwner" @click="deleteReply(reply.id)" class="button delete-button">Delete</button>
            </div>

            <!-- Reply to a Reply -->
            <button @click="toggleReplyForm(reply.id)" class="button reply-button">Reply to Reply</button>
            <div v-if="reply.showReplyForm" class="reply-form">
              <textarea v-model="replyContent[reply.id]" placeholder="Write a reply..." rows="2" class="comment-textarea"></textarea>
              <button @click="submitReply(reply.id)" class="button submit-button">Submit Reply</button>
            </div>

            <!-- Nested Replies -->
            <div v-if="reply.children && reply.children.length" class="nested-replies">
              <div v-for="nestedReply in reply.children" :key="nestedReply.id" class="nested-reply">
                <p class="reply-content">
                  <template v-if="editingReply && editingReply.id === nestedReply.id">
                    <textarea v-model="editedReplyContent" rows="2" class="comment-textarea"></textarea>
                    <button @click="updateReply" class="button submit-button">Save</button>
                    <button @click="cancelEditReply" class="button cancel-button">Cancel</button>
                  </template>
                  <template v-else>
                    {{ nestedReply.content }}
                  </template>
                </p>
                <p class="reply-author">By: {{ nestedReply.user?.name }}</p>

                <!-- Edit/Delete Nested Reply -->
                <div class="reply-actions">
                  <button v-if="isReplyOwner(nestedReply)" @click="editReply(nestedReply)" class="button edit-button">Edit</button>
                  <button v-if="isReplyOwner(nestedReply) || isPostOwner" @click="deleteReply(nestedReply.id)" class="button delete-button">Delete</button>
                </div>

                <!-- Reply to Nested Reply -->
                <button @click="toggleReplyForm(nestedReply.id)" class="button reply-button"> Reply</button>
                <div v-if="nestedReply.showReplyForm" class="reply-form">
                  <textarea v-model="replyContent[nestedReply.id]" placeholder="Write a reply..." rows="2" class="comment-textarea"></textarea>
                  <button @click="submitReply(nestedReply.id)" class="button submit-button">Submit Reply</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
  <div v-else>
    <p>Loading post details...</p>
  </div>
</template>





<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios, { AxiosError } from 'axios';
import type { Post, Comment, User } from '@/types';

export default defineComponent({
  setup() {
    const post = ref<Post | null>(null);
    const newComment = ref<string>(''); 
    const comments = ref<Comment[]>([]);
    const editingComment = ref<Comment | null>(null);
    const editedCommentContent = ref<string>('');
    const user = ref<User | null>(null);
    const showUserList = ref<boolean>(false);
    const replyContent = ref<Record<number, string>>({});
    const route = useRoute();
    const editingReply = ref<Comment | null>(null);
    const editedReplyContent = ref<string>('');

    const isPostOwner = computed(() => user.value && post.value?.user?.id === user.value.id);

    const sortedComments = computed(() => {
      return comments.value.slice().sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    });

    const isCommentOwner = (comment: Comment): boolean => {
      return user.value?.id === comment.user.id;
    };

    const isReplyOwner = (reply: Comment): boolean => {
  
  return user.value?.id !== undefined && reply.user?.id !== undefined && user.value?.id === reply.user.id;
};

    const fetchUser = async (): Promise<void> => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        alert('No authentication token found. Please log in.');
        return;
      }

      try {
        const response = await axios.get('https://interns-blog.nafistech.com/api/user', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        user.value = response.data;
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error('Error fetching user:', axiosError.response?.data || axiosError.message);
        if (axiosError.response?.status === 401) {
          alert('Unauthorized. Please log in again.');
        }
      }
    };

    
    const fetchPostDetails = async (): Promise<void> => {
      const slug = route.params.slug as string;

      try {
        const response = await axios.get(`https://interns-blog.nafistech.com/api/posts/${slug}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });

        const postData = response.data.data as Post;

        if (postData) {
          post.value = postData;
          post.value.liked = post.value.likes?.some((like: User) => like.id === user.value?.id) || false;
          comments.value = (postData.comments || []).map((comment: Comment) => ({
            ...comment,
            showReplies: false, 
            children: comment.children || [],
          }));
        } else {
          console.warn('No data received from API');
        }
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error('Error fetching post details:', axiosError.response?.data || axiosError.message);
      }
    };

    // Submit a new comment
    const submitComment = async (): Promise<void> => {
      const postSlug = post.value?.slug;
      if (!postSlug || !newComment.value.trim()) {
        console.error('Post slug is missing or comment content is empty');
        return;
      }

      try {
        await axios.post(
          `https://interns-blog.nafistech.com/api/posts/${postSlug}/comments`,
          { content: newComment.value.trim() },
          { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}`, 'Content-Type': 'application/json' } }
        );
        newComment.value = '';
        await fetchPostDetails();
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error('Error submitting comment:', axiosError.response?.data || axiosError.message);
      }
    };

    // Delete a comment
    const deleteComment = async (commentId: number): Promise<void> => {
      const postSlug = post.value?.slug;
      if (!postSlug || !commentId) {
        console.error('Invalid postSlug or comment ID');
        return;
      }

      if (!isCommentOwner(comments.value.find(comment => comment.id === commentId)!) && !isPostOwner.value) {
        console.error('User is not authorized to delete this comment');
        return;
      }

      try {
        const response = await axios.delete(`https://interns-blog.nafistech.com/api/posts/${postSlug}/comments/${commentId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });
        if (response.status === 200) {
          comments.value = comments.value.filter(comment => comment.id !== commentId);
        } else {
          console.warn('Failed to delete comment', response);
        }
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error('Error deleting comment:', axiosError.response?.data || axiosError.message);
      }
    };

    const editComment = (comment: Comment) => {
      editingComment.value = comment;
      editedCommentContent.value = comment.content;
    };

    const updateComment = async () => {
      if (!editingComment.value) return;

      const postSlug = post.value?.slug;
      if (!postSlug || !editedCommentContent.value.trim()) {
        console.error('Post slug is missing or edited comment content is empty');
        return;
      }

      try {
        await axios.put(
          `https://interns-blog.nafistech.com/api/posts/${postSlug}/comments/${editingComment.value.id}`,
          { content: editedCommentContent.value.trim() },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json',
            },
          }
        );
        editingComment.value = null;
        await fetchPostDetails();
      } catch (error) {
        const axiosError = error as AxiosError; 
        console.error('Error updating comment:', axiosError.response ? axiosError.response.data : axiosError.message);
      }
    };

    const cancelEdit = () => {
      editingComment.value = null;
    };

    const toggleLike = async () => {
      if (!post.value || !user.value) return;

      try {
        const response = await axios.post(
          `https://interns-blog.nafistech.com/api/posts/like/${post.value.slug}`,
          null,
          { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
        ); 
        post.value.liked = !post.value.liked;
        post.value.likes_count = response.data.likes_count;

        if (post.value.liked) {
          post.value.likes.push(user.value);
        } else {
          post.value.likes = post.value.likes.filter(u => u.id !== user.value?.id);
        }
      } catch (error) {
        const axiosError = error as AxiosError; 
        console.error('Error toggling like:', axiosError.response ? axiosError.response.data : axiosError.message);
      }
    };

    const toggleUserList = () => {
      showUserList.value = !showUserList.value;
    };

    const toggleReplyForm = (parentId: number) => {
      const parentComment = comments.value.find(comment => comment.id === parentId);

      if (parentComment) {
        parentComment.showReplyForm = !parentComment.showReplyForm;
      } else {
        const parentReply = findReplyById(comments.value, parentId);
        if (parentReply) {
          parentReply.showReplyForm = !parentReply.showReplyForm;
        }
      }
    };

    const submitReply = async (parentCommentId: number) => {
  const postSlug = post.value?.slug;
  const replyContentValue = replyContent.value[parentCommentId];

  if (!replyContentValue.trim()) {
    console.error('Reply content is empty');
    return;
  }

  try {
    const response = await axios.post(
      `https://interns-blog.nafistech.com/api/posts/${postSlug}/comments/`,
      { content: replyContentValue, parent_id: parentCommentId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const newReply = response.data.data;
    await fetchPostDetails();

    // If there's no user data for the new reply, add it from the current user
    if (!newReply.user) {
      newReply.user = {
        id: user.value?.id ?? 0,  
        name: user.value?.name ?? 'Unknown', 
        slug: user.value?.slug ?? '', 
      };
    }

    
    const addReplyToComment = (comment: Comment) => {
      if (comment.id === parentCommentId) {
        if (!comment.children) {
          comment.children = [];
        }
        comment.children.push(newReply);
        comment.showReplies = true;  
        return true;
      }
      if (comment.children) {
        for (const child of comment.children) {
          if (addReplyToComment(child)) {
            return true;
          }
        }
      }
      return false;
    };

   
    const updatedComments = [...comments.value];
    addReplyToComment(updatedComments);
    comments.value = updatedComments;

   
    replyContent.value[parentCommentId] = '';

  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error submitting reply:', axiosError.response ? axiosError.response.data : axiosError.message);
  }
};

    const findReplyById = (comments: Comment[], id: number): Comment | null => {
      for (let comment of comments) {
        if (comment.id === id) {
          return comment;
        }
        if (comment.children) {
          const foundReply = findReplyById(comment.children, id);
          if (foundReply) {
            return foundReply;
          }
        }
      }
      return null;
    };

    const toggleReplies = (comment: Comment) => {
      comment.showReplies = !comment.showReplies;
    };

    const editReply = (reply: Comment) => {
      editingReply.value = reply;
      editedReplyContent.value = reply.content;
    };

    const updateReply = async () => {
      if (!editingReply.value) return;

      const postSlug = post.value?.slug;
      if (!postSlug || !editedReplyContent.value.trim()) {
        console.error('Post slug is missing or edited reply content is empty');
        return;
      }

      try {
        await axios.put(
          `https://interns-blog.nafistech.com/api/posts/${postSlug}/comments/${editingReply.value.id}`,
          { content: editedReplyContent.value.trim() },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json',
            },
          }
        );
        editingReply.value = null;
        await fetchPostDetails();
      } catch (error) {
        const axiosError = error as AxiosError; // Type assertion to AxiosError
        console.error('Error updating reply:', axiosError.response ? axiosError.response.data : axiosError.message);
      }
    };

    const cancelEditReply = () => {
      editingReply.value = null;
    };

    const deleteReply = async (replyId: number) => {
      const postSlug = post.value?.slug;
      if (!postSlug || !replyId) {
        console.error('Post slug or reply ID is missing');
        return;
      }

      try {
        await axios.delete(
          `https://interns-blog.nafistech.com/api/posts/${postSlug}/comments/${replyId}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
          }
        );
        await fetchPostDetails();
      } catch (error) {
        const axiosError = error as AxiosError; // Type assertion to AxiosError
        console.error('Error deleting reply:', axiosError.response ? axiosError.response.data : axiosError.message);
      }
    };

    onMounted(async () => {
      await fetchUser();
      await fetchPostDetails();
    });

    return {
      post,
      newComment,
      comments,
      submitComment,
      deleteComment,
      editComment,
      updateComment,
      cancelEdit,
      toggleLike,
      showUserList,
      toggleUserList,
      toggleReplyForm,
      submitReply,
      toggleReplies,
      editReply,
      updateReply,
      cancelEditReply,
      deleteReply,
      replyContent,
      sortedComments,
      isCommentOwner,
      isReplyOwner,
      editingComment,
      editedCommentContent,
      editingReply,
      editedReplyContent,
      isPostOwner,
    };
  },
});
</script>



<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&family=Roboto:wght@400;500&display=swap');

.post-details {
  min-height: 100vh; 
  background-image: url('@/assets/background.jpg'); 
  background-size: cover; 
  background-position: center;
  background-repeat: no-repeat; 
  color: #fff; 
  padding: 20px; 
  margin: 20px;
  
  font-family: 'Roboto', sans-serif;
}

h1, h2, h3, .title {
  font-family: 'Montserrat', sans-serif; 
  font-weight: 700; 
}

.post-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 2.5em;
  color: #333333;
  margin-bottom: 20px;
  font-weight: bold;
  text-align: center;
  animation: fadeInDown 1s ease-out;
}

.post-content {
  font-family: 'Roboto', sans-serif;
  font-size: 1.8em;
  color: #1d1a1a;
  line-height: 1.6;
  margin-bottom: 20px;
  text-align: justify;
  animation: fadeIn 1.2s ease-out;
}

.post-image img {
  width: 60%;
  height: fit-content;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 15px;

}

.post-author {
  font-family: 'Roboto', sans-serif;
  font-size: 1em;
  color: #3498db;
  margin-top: 20px;
  padding: 5px 10px;
  border-left: 4px solid #3498db;
  background-color: #f3f4f7;
  border-radius: 5px;
  animation: fadeIn 1s ease-out;
}

.comments-section {
  margin-top: 30px;
  animation: fadeInUp 1s ease-out;
  color: #1b1805;
  font-size: 1.2em;

  
}

.comment {
  font-family: 'Roboto', sans-serif;
  font-size: 1em;
  color: #333333;
  margin-bottom: 55px;
  padding: 10px 15px;
  background-color: #f9f9f9;
  border-radius: 5px;
  animation: fadeIn 1s ease-out;
}

.comment-content {
  font-family: 'Roboto', sans-serif;
  font-size: 1.2em;
  color: #333333;
  margin-bottom: 10px;
  animation: fadeInUp 1s ease-out;
  
}

.comment-author {
  font-family: 'Roboto', sans-serif;
  font-size: 1em;
  color: #3498db;
  margin-bottom: 10px;
}

.comment-textarea {
  width: 100%;
  font-family: 'Roboto', sans-serif;
  font-size: 1.1em;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  border: 1px solid #dddddd;
  resize: vertical;
  box-sizing: border-box;
}

.button {
  font-family: 'Roboto', sans-serif;
  font-size: 1em;
  padding: 10px 15px;
  background-color: #43a0de;
  color: #f8f6f6;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  
}
.edit-button{
  background-color: #f45dc7; 
}

.edit-button:hover  {
 background-color: #983c84;
}

.submit-button {
  font-family: 'Montserrat', sans-serif;
  font-weight: bold;
  padding: 10px 13px;
}
.submit-button:hover{
  background-color: #2541b3;
}
.cancel-button {
  background-color: #e74c3c;
  margin-left: 10px;
  padding: 10px 13px;
}

.delete-button {
  background-color: #ea4141fa;
  margin-left: 80%;
  padding: 10px 13px;

}

.delete-button:hover{
  background-color: #7b1e1efa;
}

.cancel-button:hover {
  background-color: #c0392b;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.like-container {
  display: flex;
  align-items: center;
}


.like-container button {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
  transition: color 0.3s ease;
}


.like-container button .heart {
  color: rgb(251, 245, 245); 
  margin-right: 5px;
  transition: color 0.3s ease;
}


.like-container button.liked .heart {
  color: red;
}


.like-container button .heart:hover {
  color: red;
}

.likes-count {
  display: flex;
  
  align-items: center;
  
  border-radius: 5px; 
  padding: 8px 12px; 
  color: #c40404f4; 
  font-size: 1.3em; 
  margin-left: 60px;
  border: 1px solid #f1e9e9; 
  transition: background-color 0.3s, border-color 0.3s;
}

.likes-count:hover {
  background-color: #f6f0f0; 
  border-color: #f9f5f5; 
}

.show-users-button {
  background-color: #6e7d23; 
  color: #c40404f4; 
  border: none;
  border-radius: 5px; 
  padding: 4px 12px; 
  cursor: pointer;
  font-size: 1em;
  margin-left: 10px;
  transition: background-color 0.3s, color 0.3s;
}

.show-users-button:hover {
  background-color:  #f15454; 
  color: #f4f1f1; 
  
}

.liked-users {
  background-color: #f3edf0; 
  border: 1px solid #f5f0f0; 
  border-radius: 5px; 
  padding: 15px;
  margin-top: 10px; 
  margin-bottom: 20px;
  box-shadow: 0 2px 5px rgba(208, 37, 37, 0.1); 
}

.liked-users p {
  font-size: 1.2em; 
  color: #434141; 
  margin-bottom: 10px;
}



.liked-users li {
  font-size: 1.2em; 
  color: #183e56; 
  margin-bottom: 8px; 
  transition: color 0.3s; 
}


.comment{
  border-radius: 40px;
  font-weight: bold;
  width:70%;
}

.reply-form {
  margin-top: 10px;
  padding: 10px;
  background-color: #eed1e6;
  border-radius: 8px;
  border-top: 1px solid #ddd;
}

.show-replies-button {
  background-color: #f45dc7; /* Purple for show replies */
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 8px;
  margin-left: 10px;
  margin-top: 10px;
  transition: background-color 0.3s;
}

.show-replies-button:hover {
  background-color: #983c84;
  
}

.reply {
  margin-left: 40px; /* Shift replies to the right */
  padding: 15px;
  margin-top: 10px;
  background-color: #ebe1e8;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(114, 26, 76, 0.875);
  animation: fadeIn 0.6s ease-out;
  border-left: 2px solid #436589;
  padding-left: 15px;
  margin-left: 15px;
  background-color: #f1f1f1;
}

.reply-content {
  font-family: 'Roboto', sans-serif;
  font-size: 1em;
  color: #0d1d2d;
  margin-bottom: 10px;
}

.reply-author {
  font-family: 'Roboto', sans-serif;
  font-size: 0.9em;
  color: #8c4774f6;
  font-weight: bold;
}


/* Shift nested replies more to the right */
.reply .reply {
  margin-left: 20px;
  padding-left: 10px;
  border-left: 1px solid #ddd;
  background-color: #e9e9e9;
}

.replies {
  margin-top: 10px;
}

.reply-button{
  font-family: 'Montserrat', sans-serif;
  font-weight: bold;
  background-color: #f45dc7;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s;
  display: inline-block;
  text-align: center;
  margin-top: 10px;
}


.nested-reply {
  border-left: 2px solid  #436589;
  padding-left: 15px;
  margin-left: 15px;
  background-color: #e9ecef;
}
.reply-actions {
  margin-top: 10px;
}





</style>
