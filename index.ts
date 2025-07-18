import { Hono } from "hono";
import { createClient } from "redis";
import axios from "axios";
const app = new Hono()
const key = String(process.env.KEY)

let requests = 0;
app.get("/api", async(c) => {
    const redis = createClient();
    redis.on("error", (err) => console.log("Redis Client Error", err));
    await redis.connect();
    const location = c.req.query("location")
    try {
        if(!location) {
        return c.json({
            CREATOR: 'SHELL HAKI',
            SOURCE: 'https://weather.visualcrossing.com',
            ERROR: `provide location`
        }, 401)
    }
    const isPresent = await redis.get(`api-req-${location}`)
    const res = await axios.get(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/lagos?key=${key}&include=current`)
 
    if(isPresent) {
        return c.json({
            CREATOR: 'SHELL HAKI',
            SOURCE: 'https://weather.visualcrossing.com',
            DATA: isPresent
        })
    }
  
    await redis.set(`api-req-${location}`, JSON.stringify(res.data))
    await redis.expire(`api-req-${location}`, 43200)
    requests ++
    return c.json({
            CREATOR: 'SHELL HAKI',
            SOURCE: 'https://weather.visualcrossing.com',
            DATA: res.data
        })
    
    }catch(e){
        console.log(e);
        
    }
})
app.get("/requests", (c) => {
    return c.json({requests: `${requests} requests made so far`})
})
Bun.serve({
    fetch: app.fetch,
    port: Number(process.env.PORT) || 3000
})
console.log("weather rapper api running fine")


// http://localhost:5000/api?location=lagos