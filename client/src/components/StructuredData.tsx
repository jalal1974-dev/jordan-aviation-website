import { useEffect } from 'react';

export function StructuredData() {
  useEffect(() => {
    // Organization Schema
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Jordan Aviation',
      url: 'https://jordan-aviation.manus.space',
      logo: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663380965890/HWWc8DMeLEgwAMnr63AArn/hero-amman-skyline-kQa6vFg4eb5toPJ2CHzLsr.webp',
      description: 'Premium airline service connecting the Middle East with bilingual booking experience',
      sameAs: [
        'https://www.facebook.com/jordanaviation',
        'https://www.twitter.com/jordanaviation',
        'https://www.instagram.com/jordanaviation',
        'https://www.linkedin.com/company/jordan-aviation',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        telephone: '+962-6-5555445',
        email: 'support@jordanaviation.com',
        areaServed: ['JO', 'EG', 'KW', 'IQ', 'TR', 'AE', 'SA'],
        availableLanguage: ['en', 'ar'],
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Queen Alia International Airport',
        addressLocality: 'Amman',
        addressRegion: 'Amman',
        postalCode: '11134',
        addressCountry: 'JO',
      },
    };

    // Airline Schema
    const airlineSchema = {
      '@context': 'https://schema.org',
      '@type': 'Airline',
      name: 'Jordan Aviation',
      url: 'https://jordan-aviation.manus.space',
      logo: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663380965890/HWWc8DMeLEgwAMnr63AArn/hero-amman-skyline-kQa6vFg4eb5toPJ2CHzLsr.webp',
      iataCode: 'RJ',
      icaoCode: 'RJA',
      sameAs: 'https://www.jordanaviation.com',
      knowsAbout: ['Air Travel', 'Flight Booking', 'Middle East Airlines'],
    };

    // Website Schema
    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Jordan Aviation',
      url: 'https://jordan-aviation.manus.space',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://jordan-aviation.manus.space/search-results?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
      inLanguage: ['en', 'ar'],
    };

    // Local Business Schema
    const localBusinessSchema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': 'https://jordan-aviation.manus.space',
      name: 'Jordan Aviation',
      image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663380965890/HWWc8DMeLEgwAMnr63AArn/hero-amman-skyline-kQa6vFg4eb5toPJ2CHzLsr.webp',
      description: 'Premium airline service connecting the Middle East',
      url: 'https://jordan-aviation.manus.space',
      telephone: '+962-6-5555445',
      email: 'support@jordanaviation.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Queen Alia International Airport',
        addressLocality: 'Amman',
        addressCountry: 'JO',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 31.7254,
        longitude: 35.9284,
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.5',
        ratingCount: '250',
      },
    };

    // Add all schemas to head
    const schemas = [
      organizationSchema,
      airlineSchema,
      websiteSchema,
      localBusinessSchema,
    ];

    schemas.forEach((schema) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      // Cleanup scripts on unmount
      document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
        if (
          script.textContent?.includes('Jordan Aviation') &&
          script.textContent?.includes('@context')
        ) {
          script.remove();
        }
      });
    };
  }, []);

  return null;
}
