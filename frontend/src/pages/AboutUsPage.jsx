import React from "react";
import { Link } from "react-router-dom";

const AboutUsPage = () => {
  // Team members data
  const teamMembers = [
    {
      name: "John Doe",
      position: "Founder & CEO",
      image: "./assets/images/team-1.jpg",
      bio: "John has over 15 years of experience in furniture design and retail. He founded our company with a vision to make beautiful, functional furniture accessible to everyone.",
    },
    {
      name: "Jane Smith",
      position: "Head of Design",
      image: "./assets/images/team-2.jpg",
      bio: "With a background in interior design, Jane leads our product development team, ensuring each piece meets our high standards for style and functionality.",
    },
    {
      name: "Michael Johnson",
      position: "Operations Manager",
      image: "./assets/images/team-3.jpg",
      bio: "Michael oversees our supply chain and manufacturing partnerships, ensuring sustainable practices and timely delivery of all products.",
    },
    {
      name: "Sarah Williams",
      position: "Customer Experience",
      image: "./assets/images/team-4.jpg",
      bio: "Sarah is dedicated to making sure every customer has an exceptional experience, from browsing our catalog to enjoying their furniture for years to come.",
    },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <section className="bg-gray-100 py-4">
        <div className="mx-auto max-w-[1200px] px-5">
          <ul className="flex items-center">
            <li className="flex items-center">
              <Link to="/" className="text-gray-600 hover:text-amber-500">
                Home
              </Link>
              <span className="mx-2 text-gray-500">/</span>
            </li>
            <li className="text-amber-500">About Us</li>
          </ul>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-[1200px] px-5">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div className="flex flex-col justify-center">
              <h1 className="mb-4 text-4xl font-bold text-gray-900">
                Our Story
              </h1>
              <p className="mb-6 text-lg text-gray-700">
                Founded in 2010, our furniture company began with a simple
                mission: to create beautiful, functional, and affordable
                furniture for modern homes. What started as a small workshop has
                grown into a beloved brand known for quality craftsmanship and
                timeless design.
              </p>
              <p className="text-lg text-gray-700">
                We believe that everyone deserves to live in a space they love.
                Our team of designers and craftspeople work together to create
                pieces that combine style, comfort, and durability, using
                sustainable materials and ethical manufacturing practices.
              </p>
            </div>
            <div className="overflow-hidden rounded-lg">
              <img
                src="./assets/images/about-hero.jpg"
                alt="Our workshop"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="mx-auto max-w-[1200px] px-5">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Our Values
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-6 shadow-md transition hover:shadow-lg">
              <div className="mb-4 inline-block rounded-full bg-amber-100 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-8 w-8 text-amber-500">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Quality</h3>
              <p className="text-gray-700">
                We never compromise on quality. Every piece of furniture we
                create is built to last, using the finest materials and expert
                craftsmanship.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md transition hover:shadow-lg">
              <div className="mb-4 inline-block rounded-full bg-amber-100 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-8 w-8 text-amber-500">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Design</h3>
              <p className="text-gray-700">
                We believe in the power of thoughtful design to enhance everyday
                living. Our pieces are beautiful, functional, and built to stand
                the test of time.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md transition hover:shadow-lg">
              <div className="mb-4 inline-block rounded-full bg-amber-100 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-8 w-8 text-amber-500">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.25 2.25 0 0017.128 15H16.5l-.324-.324a1.453 1.453 0 00-2.328.377l-.036.073a1.586 1.586 0 01-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 01-5.276 3.67m0 0a9 9 0 01-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                Sustainability
              </h3>
              <p className="text-gray-700">
                We're committed to minimizing our environmental impact by using
                sustainable materials, reducing waste, and partnering with
                responsible suppliers.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md transition hover:shadow-lg">
              <div className="mb-4 inline-block rounded-full bg-amber-100 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-8 w-8 text-amber-500">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                Community
              </h3>
              <p className="text-gray-700">
                We value the relationships we build with our customers,
                employees, and partners. Together, we're creating spaces that
                bring people together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-[1200px] px-5">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-lg bg-white shadow-md transition hover:shadow-lg">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-64 w-full object-cover"
                />
                <div className="p-6">
                  <h3 className="mb-1 text-xl font-bold text-gray-900">
                    {member.name}
                  </h3>
                  <p className="mb-4 text-amber-500">{member.position}</p>
                  <p className="text-gray-700">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="mx-auto max-w-[1200px] px-5">
          <div className="rounded-lg bg-amber-50 p-8 text-center shadow-md">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Ready to Transform Your Space?
            </h2>
            <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-700">
              Browse our collection of thoughtfully designed furniture pieces
              and find the perfect additions for your home.
            </p>
            <Link
              to="/catalog"
              className="inline-block rounded bg-amber-400 px-6 py-3 font-bold text-gray-900 transition hover:bg-yellow-300">
              Shop Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;
