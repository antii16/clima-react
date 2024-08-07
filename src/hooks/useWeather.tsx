import { useMemo, useState } from 'react'
import axios from 'axios'
import { z } from 'zod'
// import { object, string, number, InferOutput, parse} from 'valibot'
import { SearchType } from '../types'


// 2. Type Guard o Assertion
// function isWeatherResponse(weather: unknown) : weather is Weather{
//     // Revisa que el clima contenga el objeto que buscamos
//     return(
//         Boolean(weather) &&
//         typeof weather === 'object' &&
//         typeof (weather as Weather).name === 'string' &&
//         typeof (weather as Weather).main.temp === 'number' &&
//         typeof (weather as Weather).main.temp_max === 'number' &&
//         typeof (weather as Weather).main.temp_min === 'number'
//     )
// }

// Zod
const Weather = z.object({
    name: z.string(),
    main: z.object({
        temp: z.number(),
        temp_max: z.number(),
        temp_min: z.number()
    })
})
export type Weather = z.infer<typeof Weather>

// Valibot
// const WeatherSchema = object({
//     name: string(),
//     main: object({
//         temp: number(),
//         temp_max:number(),
//         temp_min: number()
//     })
// })

// type Weather = InferOutput<typeof WeatherSchema>
const initialState = {
    name: '',
    main: {
        temp: 0,
        temp_max: 0,
        temp_min: 0
    }
}
export default function useWeather() {

    const [weather, setWeather] = useState<Weather>(initialState)
    const [loading, setLoading] = useState(false)
    const [notFound, setNotFound] = useState(false)

    const fetchWeather = async (search: SearchType) => {
        const appId = import.meta.env.VITE_API_KEY
        setLoading(true)
        setWeather(initialState)
        setNotFound(false)

        try {
            const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${search.city},${search.country}&appid=${appId}`
            const { data } = await axios(geoUrl)
            
            // Comprobar si existe
            if(!data[0]) {
                setNotFound(true)
                return //para que no se ejecute el resto de código
            }
            const lat = data[0].lat
            const lon = data[0].lon

            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appId}`

            // 1. Castear el type
            // const { data: weatherResult } = await axios<Weather>(weatherUrl)
            // console.log(weatherResult.main.temp_max)

            // 2. Type Guards
            // const { data: weatherResult } = await axios(weatherUrl)
            // const result = isWeatherResponse(weatherResult)
            // if(result) {
            //     console.log(weatherResult.name)
            // }else{
            //     console.log('Respuesta mal formada')
            // }

            // 3. Zod
            const { data: weatherResult } = await axios(weatherUrl)
            const result = Weather.safeParse(weatherResult) // Devuelve un boolean y el objeto
            if (result.success) {
                setWeather(result.data)
            } else {
                console.log('Respuesta mal formada')
            }

            // 4. Valibot
            // const { data: weatherResult } = await axios(weatherUrl)
            // const result = parse(WeatherSchema, weatherResult)

            // if(result) {
            //     console.log(result.name)
            // }else{
            //     console.log('Respuesta mal formada')
            // }

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }
    const hasWeatherData = useMemo(() => weather.name, [weather])

    return {
        weather,
        loading,
        fetchWeather,
        hasWeatherData, 
        notFound
    }
}