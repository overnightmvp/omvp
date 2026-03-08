import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import { getPublishedPageByHandle } from '@/lib/db/generated-pages'

interface PageParams {
  params: Promise<{
    creator: string
    slug: string
  }>
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { creator, slug } = await params
  const page = await getPublishedPageByHandle(creator, slug)

  if (!page) {
    return {
      title: 'Page Not Found',
    }
  }

  return {
    title: page.headline,
    description: page.meta_description,
  }
}

/**
 * Dynamic page renderer for published creator content
 * Accessible via creator.platform.com/[slug]
 */
export default async function CreatorPage({ params }: PageParams) {
  const { creator, slug } = await params

  // Fetch published page
  const page = await getPublishedPageByHandle(creator, slug)

  // Return 404 if page not found or not published
  if (!page) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(page.schema_markup),
        }}
      />

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          {page.headline}
        </h1>

        {/* Meta Description */}
        <p className="text-xl text-gray-300 mb-12 leading-relaxed">
          {page.meta_description}
        </p>

        {/* Article Body */}
        <div className="prose prose-invert prose-lg max-w-none">
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className="text-3xl font-bold mt-12 mb-4 text-white">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-2xl font-semibold mt-8 mb-3 text-white">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-gray-200 leading-relaxed mb-6">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-6 text-gray-200 space-y-2">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-6 text-gray-200 space-y-2">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-200">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-white">{children}</strong>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-blue-400 hover:text-blue-300 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
            }}
          >
            {page.content}
          </ReactMarkdown>
        </div>

        {/* FAQ Section */}
        {page.faqs && page.faqs.length > 0 && (
          <section className="mt-16 border-t border-gray-800 pt-12">
            <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="space-y-8">
              {page.faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-800 pb-6">
                  <h3 className="text-xl font-semibold mb-3 text-white">
                    {faq.question}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center">
          <p className="text-gray-400 text-sm">
            Powered by{' '}
            <a
              href={process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.com'}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Authority Platform
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
