import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const EpisodeCard = () => {
  return (
    <div className="flex flex-col items-center w-72 h-auto bg-gray m-3 ">
      <div className="  hover:opacity-75">
        <Link href="/movies" title="title">
          <Image
            src="/episodeImg.jpg"
            alt="Picture"
            className="rounded w-full h-full"
            width={288}
            height={176}
          />
        </Link>
      </div>
      <p className="text-center text-white text-sm font-normal m-2">2x1: The Man of Science</p>
    </div>
  )
}

export default EpisodeCard