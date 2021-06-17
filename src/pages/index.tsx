import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import { FiCalendar, FiUser } from "react-icons/fi";
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Prismic from '@prismicio/client';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: String;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({postsPagination} : HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results)

  const [nextPage, setNextPage] = useState(postsPagination.next_page)

  async function showMore() {
    const postsResults = await fetch(`${nextPage}`).then(response => response.json())
    const newPosts = postsResults.results.map(post => {
      return {
        uid: post.uid,
        data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
      }
    })
    setPosts([...posts, ...newPosts])
    setNextPage(null)
  }

  
  return (
    <main className={styles.container}>

      <div className={styles.posts}>
      <img src="/logo.svg" alt="logo" />


        {posts.map(post => (
          <>
            <a key={post.uid} href={`/post/${post.uid}`}>{post.data.title}</a>
            <p>{post.data.subtitle}</p>
            <span><FiCalendar /> {post.first_publication_date}</span>
            <span><FiUser /> {post.data.author}</span>
            
          </>
        ))}
        {nextPage 
          ? <button className={styles.botao} onClick={showMore}>Carregar mais posts</button> 
          : <> </>
        }
        

      </div>


    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 2,
  });

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    };
  })


  return {
    props: {
      postsPagination :{
        results,
        next_page: postsResponse.next_page
      }
    }
  }
};
