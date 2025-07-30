"use client";

import Link from "next/link";
import styles from "@/styles/components/ProjectCard.module.css";

type Props = {
  slug: string;
  title: string;
  description: string;
  image: string;
};

export default function ProjectCard({
  slug,
  title,
  description,
  image,
}: Props) {
  return (
    <Link href={`/projects/${slug}`} className={styles.card}>
      <img src={image} alt={title} className={styles.image} />
      <h3>{title}</h3>
      <p>{description}</p>
    </Link>
  );
}
