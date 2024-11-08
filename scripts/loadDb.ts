import { DataAPIClient } from "@datastax/astra-db-ts"
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import OpenAI from "openai"

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

import "dotenv/config"

type SimilarityMetric = "cosine" | "dot_product" | "euclidean"

const {ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, OPENAI_API_KEY} = process.env

if (!ASTRA_DB_API_ENDPOINT || !ASTRA_DB_APPLICATION_TOKEN || !ASTRA_DB_NAMESPACE) {
    console.log(ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_COLLECTION, ASTRA_DB_NAMESPACE)
    throw new Error("Missing required environment variables")
}

// const ASTRA_DB_NAMESPACE="default_keyspace"
// const ASTRA_DB_COLLECTION="seen_apps_chatbot"
// const ASTRA_DB_API_ENDPOINT="https://c36f6118-8de7-45da-8d81-162909e1a5ab-us-east-2.apps.astra.datastax.com"
// const ASTRA_DB_APPLICATION_TOKEN="AstraCS:UxpHZtWbYBeexYTZqlISzNlf:01d6730b5ea3ad330d122a16d9dd880d9df77322178d372d9a824f4aa4d9848c"
// const OPENAI_API_KEY="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"

const openai = new OpenAI({apiKey: OPENAI_API_KEY})

const seenAppsData = [ 
    'https://www.seen-apps.com/',
    'https://www.seen-apps.com/a-propos',
    'https://www.seen-apps.com/contact',
    'https://www.seen-perf.com/',
    'https://www.seen-care.com/',
    'https://www.seen-exp.com/'
]

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE })

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100
})
const createCollection = async (similarityMetric: SimilarityMetric = "dot_product") => {
    if (!ASTRA_DB_COLLECTION) {
        throw new Error("ASTRA_DB_COLLECTION environment variable is required")
    }
    const res = await db.createCollection(ASTRA_DB_COLLECTION, {
        vector: {
            dimension: 1536,
            metric: similarityMetric
        }
    })
    console.log(res)
}
const loadSampledData = async () => {
    if (!ASTRA_DB_COLLECTION) {
        throw new Error("ASTRA_DB_COLLECTION environment variable is required")
    }
    const collection = await db.collection(ASTRA_DB_COLLECTION)
    for await (const url of seenAppsData) {
        const content = await scrapePage(url)
        const chunks = await splitter.splitText(content)
        for await (const chunk of chunks) {
            const embedding = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: chunk,
                encoding_format: "float"
            })
            const vector = embedding.data[0].embedding
            const res = await collection.insertOne({
                $vector: vector,
                text: chunk
            })
            console.log(res)
        }
    }
}

const scrapePage = async (url: string) => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
            headless: true
        },
        gotoOptions: {
            waitUntil: "domcontentloaded"
        },
        evaluate: async (page) => {
            const result = await page.evaluate(() => document.body.innerHTML)
            await page.browser().close()
            return result
        }
    })
    return ( await loader.scrape())?.replace(/<[^>]*>?/gm, "")
}

createCollection().then(() => loadSampledData())