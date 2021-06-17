import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar,FiClock, FiUser } from "react-icons/fi";

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post} : PostProps) {

  const totalWords = post.data.content.reduce((total, contentItem) => {
    total += contentItem.heading.split(' ').length;

    const words = contentItem.body.map(item => item.text.split(' ').length);
    words.map(word => (total += word));
    return total;
  }, 0);

  const time = Math.ceil(totalWords/200);


  return(
    <div className={styles.screen}>
      <div className={styles.container}>

        <div className={styles.logo}>
          <img src="/logo.svg" alt="logo" /> 
        </div>


      </div>

      <div className={styles.banner}>
        <img src={`${post.data.banner.url}`} alt="logo" />     
      </div>

      <div className={styles.post}>
        <h1>{post.data.title}</h1>
        <span><FiCalendar /> {post.first_publication_date}</span>
        <span><FiUser /> {post.data.author}</span>
        <span><FiClock /> {time} min</span>

        {post.data.content.map(content => {
          return (
            <article key={content.heading}>
              <h2>{content.heading}</h2>
              <div className={styles.postBody}
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              >
              </div>
            </article>
          )
        })}
      </div>

      <footer className={styles.foot}>

      </footer>

    </div>

)
}

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
};

export const getStaticProps : GetStaticProps= async ({ params }) => {
  const {slug} = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});
  console.log(JSON.stringify(response, null, 2))

  const post = {
    first_publication_date: new Date(response.first_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        }
      })
    }
  }
  return {
    props: {
      post
    }
  }
};
