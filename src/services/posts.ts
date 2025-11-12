import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  doc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  type Firestore,
  type Query,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { User } from 'firebase/auth';
import { getUserProfile } from './users';

export type Comment = {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: Date;
};

export type Post = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  text: string;
  imageUrl?: string;
  likes: string[]; // Array of user IDs who liked the post
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
  editedAt?: Date; // When the post was last edited
};

export type CreatePostData = {
  text: string;
  imageUrl?: string;
};

// Create a new post
export const createPost = async (
  user: User,
  data: CreatePostData,
): Promise<string> => {
  try {
    // Get username from Firestore user profile (with timeout fallback)
    let userProfile = null;
    try {
      userProfile = await getUserProfile(user.uid);
    } catch (profileError) {
      console.warn('Could not fetch user profile, using fallback:', profileError);
    }
    
    const username = userProfile?.username || user.displayName || user.email?.split('@')[0] || 'Anonymous';
    
    const postData = {
      userId: user.uid,
      userName: username,
      userEmail: user.email || '',
      userAvatar: userProfile?.avatar || user.photoURL || null,
      text: data.text,
      imageUrl: data.imageUrl || null,
      likes: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('Creating post with data:', { ...postData, text: postData.text.substring(0, 50) + '...' });
    
    const docRef = await addDoc(collection(db, 'posts'), postData);
    console.log('Post created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating post:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw new Error(error.message || `Failed to create post: ${error.code || 'Unknown error'}`);
  }
};

// Subscribe to all posts (real-time feed)
export const subscribeToPosts = (
  callback: (posts: Post[]) => void,
  maxPosts: number = 50,
): Unsubscribe => {
  // Try with orderBy first, fallback to simple query if index is missing
  const q = query(
    collection(db, 'posts'),
    orderBy('createdAt', 'desc'),
    limit(maxPosts),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      console.log('Feed posts snapshot received:', snapshot.docs.length, 'docs');
      const posts: Post[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        
        // Process comments - handle both Date objects and Timestamps
        const processedComments = (data.comments || []).map((comment: any) => {
          let commentDate: Date;
          if (comment.createdAt?.toDate) {
            // Firestore Timestamp
            commentDate = comment.createdAt.toDate();
          } else if (comment.createdAt instanceof Date) {
            // Already a Date object
            commentDate = comment.createdAt;
          } else if (comment.createdAt?.seconds) {
            // Timestamp with seconds
            commentDate = new Date(comment.createdAt.seconds * 1000);
          } else {
            // Fallback
            commentDate = new Date();
          }
          
          return {
            id: comment.id || '',
            userId: comment.userId || '',
            userName: comment.userName || 'Anonymous',
            userAvatar: comment.userAvatar || null,
            text: comment.text || '',
            createdAt: commentDate,
          };
        });
        
        return {
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          userEmail: data.userEmail,
          userAvatar: data.userAvatar,
          text: data.text,
          imageUrl: data.imageUrl,
          likes: data.likes || [],
          comments: processedComments,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          editedAt: data.editedAt?.toDate() || undefined,
        };
      });
      
      // Sort by createdAt desc in case orderBy didn't work
      posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      console.log('Processed feed posts:', posts.length);
      callback(posts);
    },
    (error) => {
      console.error('Error subscribing to posts:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // If index error, try without orderBy
      if (error.code === 'failed-precondition' || error.message?.includes('index')) {
        console.log('Index missing, trying query without orderBy...');
        const qWithoutOrder = query(
          collection(db, 'posts'),
          limit(maxPosts),
        );
        
        return onSnapshot(
          qWithoutOrder,
          (snapshot) => {
            const posts: Post[] = snapshot.docs.map((doc) => {
              const data = doc.data();
              const processedComments = (data.comments || []).map((comment: any) => ({
                id: comment.id || '',
                userId: comment.userId || '',
                userName: comment.userName || 'Anonymous',
                userAvatar: comment.userAvatar || null,
                text: comment.text || '',
                createdAt: comment.createdAt?.toDate() || (comment.createdAt instanceof Date ? comment.createdAt : new Date()),
              }));
              
              return {
                id: doc.id,
                userId: data.userId,
                userName: data.userName,
                userEmail: data.userEmail,
                userAvatar: data.userAvatar,
                text: data.text,
                imageUrl: data.imageUrl,
                likes: data.likes || [],
                comments: processedComments,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                editedAt: data.editedAt?.toDate() || undefined,
              };
            });
            
            // Sort by createdAt desc
            posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            callback(posts);
          },
          (retryError) => {
            console.error('Error with fallback query:', retryError);
            callback([]);
          },
        );
      }
      
      callback([]);
    },
  );
};

// Subscribe to posts by a specific user
export const subscribeToUserPosts = (
  userId: string,
  callback: (posts: Post[]) => void,
): Unsubscribe => {
  // Use simple query without orderBy to avoid index requirement
  // We'll sort in JavaScript instead
  const q = query(
    collection(db, 'posts'),
    where('userId', '==', userId),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      console.log('User posts snapshot received:', snapshot.docs.length, 'docs');
      let posts: Post[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        
        // Process comments - handle both Date objects and Timestamps
        const processedComments = (data.comments || []).map((comment: any) => {
          let commentDate: Date;
          if (comment.createdAt?.toDate) {
            commentDate = comment.createdAt.toDate();
          } else if (comment.createdAt instanceof Date) {
            commentDate = comment.createdAt;
          } else if (comment.createdAt?.seconds) {
            commentDate = new Date(comment.createdAt.seconds * 1000);
          } else {
            commentDate = new Date();
          }
          
          return {
            id: comment.id || '',
            userId: comment.userId || '',
            userName: comment.userName || 'Anonymous',
            userAvatar: comment.userAvatar || null,
            text: comment.text || '',
            createdAt: commentDate,
          };
        });
        
        return {
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          userEmail: data.userEmail,
          userAvatar: data.userAvatar,
          text: data.text,
          imageUrl: data.imageUrl,
          likes: data.likes || [],
          comments: processedComments,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          editedAt: data.editedAt?.toDate() || undefined,
        };
      });
      
      // Sort by createdAt desc in JavaScript
      posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      console.log('Processed user posts:', posts.length);
      callback(posts);
    },
    (error) => {
      console.error('Error subscribing to user posts:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      // Still call callback with empty array to stop loading
      callback([]);
    },
  );
};

// Delete a post
export const deletePost = async (postId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'posts', postId));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete post');
  }
};

// Edit a post
export const editPost = async (
  postId: string,
  newText: string,
): Promise<void> => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      text: newText.trim(),
      editedAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Post edited successfully');
  } catch (error: any) {
    console.error('Error editing post:', error);
    throw new Error(error.message || 'Failed to edit post');
  }
};

// Like a post
export const likePost = async (postId: string, userId: string): Promise<void> => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: arrayUnion(userId),
      updatedAt: new Date(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to like post');
  }
};

// Unlike a post
export const unlikePost = async (postId: string, userId: string): Promise<void> => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: arrayRemove(userId),
      updatedAt: new Date(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to unlike post');
  }
};

// Add a comment to a post
export const addComment = async (
  postId: string,
  user: User,
  text: string,
): Promise<void> => {
  try {
    // Get user profile with fallback
    let userProfile = null;
    try {
      userProfile = await getUserProfile(user.uid);
    } catch (profileError) {
      console.warn('Could not fetch user profile for comment, using fallback:', profileError);
    }
    
    const username = userProfile?.username || user.displayName || user.email?.split('@')[0] || 'Anonymous';
    
    // Create comment as plain object (not class instance) for Firestore
    const comment = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user.uid,
      userName: username,
      userAvatar: userProfile?.avatar || user.photoURL || null,
      text: text.trim(),
      createdAt: new Date(),
    };

    console.log('Adding comment to post:', postId, comment);

    const postRef = doc(db, 'posts', postId);
    
    // Use arrayUnion to add comment
    await updateDoc(postRef, {
      comments: arrayUnion(comment),
      updatedAt: new Date(),
    });
    
    console.log('Comment added successfully');
  } catch (error: any) {
    console.error('Error adding comment:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw new Error(error.message || `Failed to add comment: ${error.code || 'Unknown error'}`);
  }
};

// Format timestamp for display
export const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'Just now';
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

