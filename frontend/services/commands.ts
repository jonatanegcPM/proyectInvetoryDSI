import { getAIResponse } from "./ai";
import { AuthService } from "./auth-service";

interface Command {
    name: string;
    description: string;
    handler: (args: string[]) => Promise<string>;
}


// Función para normalizar texto (eliminar acentos y convertir a minúsculas)
const normalizeText = (text: string): string => {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
};


// Función para obtener el token de autenticación
const getAuthToken = (): string | null => {
    try {
        // Intentar obtener de AuthService
        const token = AuthService.getToken();
        if (token) return token;
        
        // Si no hay token en AuthService, intentar obtenerlo directamente de localStorage
        if (typeof window !== 'undefined') {
            // Intentar con diferentes nombres de token
            const possibleTokenNames = ['auth_token', 'token', 'authToken', 'accessToken'];
            
            for (const tokenName of possibleTokenNames) {
                const localToken = localStorage.getItem(tokenName);
                if (localToken) return localToken;
            }
            
            // Verificar si hay usuario en localStorage (esto indicaría que el usuario está logueado)
            const userStr = localStorage.getItem('user');
            if (userStr) return "mock_token";
        }
        
        return null;
    } catch (error) {
        return null;
    }
};


// Función genérica para hacer peticiones autenticadas
const fetchWithAuth = async (url: string): Promise<any> => {
    const token = getAuthToken();
    
    if (!token) {
        throw new Error("No hay sesión activa. Por favor, inicia sesión para usar esta función.");
    }
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (response.status === 401) {
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
    }
    
    if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
    }
    
    return response.json();
};


// Función para buscar productos
const searchProduct = async (name: string): Promise<string> => {
    try {
        // Enviar la búsqueda sin modificar los acentos para que el backend se encargue
        const url = `${process.env.NEXT_PUBLIC_API_URL}/inventory/search?name=${encodeURIComponent(name)}`;
        const data = await fetchWithAuth(url);
        
        if (!data || data.length === 0) {
            return `No se encontró ningún producto con el nombre "${name}"`;
        }

        const product = data[0];
        return `Producto: ${product.name}\n` +
               `Descripción: ${product.description || 'No disponible'}\n` +
               `Precio: $${product.price}\n` +
               `Stock actual: ${product.stock}\n` +
               `Categoría: ${product.category || 'No categorizado'}`;
    } catch (error) {
        if (error instanceof Error && error.message.includes("sesión")) {
            return error.message;
        }
        return `Lo siento, hubo un error al buscar el producto "${name}". Por favor, inténtalo de nuevo más tarde.`;
    }
};


// Función para verificar stock
const checkStock = async (name: string): Promise<string> => {
    try {
        // Enviar la búsqueda sin modificar los acentos para que el backend se encargue
        const url = `${process.env.NEXT_PUBLIC_API_URL}/inventory/stock?name=${encodeURIComponent(name)}`;
        const data = await fetchWithAuth(url);
        
        if (!data) {
            return `No se encontró información de stock para "${name}"`;
        }

        return `Stock actual de ${data.name}: ${data.stock} unidades\n` +
               `Stock mínimo: ${data.minStock || 0} unidades\n` +
               `Estado: ${data.stock <= (data.minStock || 0) ? "BAJO STOCK" : "OK"}`;
    } catch (error) {
        if (error instanceof Error && error.message.includes("sesión")) {
            return error.message;
        }
        return `Lo siento, hubo un error al verificar el stock para "${name}". Por favor, inténtalo de nuevo más tarde.`;
    }
};


// Función para obtener últimas ventas
const getRecentSales = async (): Promise<string> => {
    try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/pos/recent-sales`;
        const data = await fetchWithAuth(url);
        
        if (!data || data.length === 0) {
            return "No hay ventas recientes";
        }

        let result = "Últimas ventas:\n";
        data.forEach((sale: any) => {
            result += `\nFecha: ${new Date(sale.date).toLocaleString()}\n` +
                     `Total: $${sale.total}\n` +
                     `Productos: ${sale.items.map((item: any) => `${item.name} (${item.quantity})`).join(", ")}\n`;
        });
        return result;
    } catch (error) {
        if (error instanceof Error && error.message.includes("sesión")) {
            return error.message;
        }
        return "Lo siento, hubo un error al obtener las ventas recientes. Por favor, inténtalo de nuevo más tarde.";
    }
};


// Función para obtener productos con bajo stock
const getLowStock = async (): Promise<string> => {
    try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/inventory/low-stock`;
        const data = await fetchWithAuth(url);
        
        if (!data || data.length === 0) {
            return "No hay productos con bajo stock";
        }

        let result = "Productos con bajo stock:\n";
        data.forEach((product: any) => {
            result += `\n${product.name}\n` +
                     `Stock actual: ${product.stock}\n` +
                     `Stock mínimo: ${product.minStock}\n`;
        });
        return result;
    } catch (error) {
        if (error instanceof Error && error.message.includes("sesión")) {
            return error.message;
        }
        return "Lo siento, hubo un error al obtener los productos con bajo stock. Por favor, inténtalo de nuevo más tarde.";
    }
};


// Lista de comandos disponibles
const commands: Command[] = [
    {
        name: "producto",
        description: "Buscar información de un producto",
        handler: async (args) => {
            if (args.length === 0) return "Por favor, especifica el nombre del producto, por ejemplo: /producto paracetamol";
            return searchProduct(args.join(" "));
        }
    },
    {
        name: "stock",
        description: "Verificar el stock de un producto",
        handler: async (args) => {
            if (args.length === 0) return "Por favor, especifica el nombre del producto, por ejemplo: /stock paracetamol";
            return checkStock(args.join(" "));
        }
    },
    {
        name: "ultimas ventas",
        description: "Ver las últimas ventas realizadas",
        handler: async () => getRecentSales()
    },
    {
        name: "bajo stock",
        description: "Ver productos con bajo stock",
        handler: async () => getLowStock()
    }
];


// Función para procesar mensajes y determinar si es un comando o una pregunta para la IA
export async function processMessage(message: string): Promise<string> {
    // Verificar si el mensaje comienza con "/"
    if (message.startsWith("/")) {
        const messageWithoutSlash = message.slice(1).trim();
        
        // Normalizar el mensaje del usuario para hacerlo insensible a acentos
        const normalizedUserMessage = normalizeText(messageWithoutSlash);
        
        // Buscar el comando que coincida con el inicio del mensaje normalizado
        const matchedCommand = commands.find(cmd => 
            normalizedUserMessage.startsWith(normalizeText(cmd.name))
        );

        if (matchedCommand) {
            try {
                // Verificar autenticación antes de ejecutar comandos
                const token = getAuthToken();
                
                // Si no hay autenticación, informar al usuario
                if (!token) {
                    return "Para usar los comandos necesitas iniciar sesión. Los comandos acceden a datos del sistema que requieren autenticación por seguridad.";
                }
                
                // Extraer los argumentos (todo lo que viene después del nombre del comando)
                const args = messageWithoutSlash
                    .substring(matchedCommand.name.length)
                    .trim()
                    .split(" ")
                    .filter(arg => arg.length > 0);
                    
                return await matchedCommand.handler(args);
            } catch (error) {
                if (error instanceof Error) {
                    return `Error: ${error.message}`;
                }
                return "Ocurrió un error al procesar el comando.";
            }
        } else {
            return "Comando no reconocido. Comandos disponibles:\n" +
                   commands.map(cmd => `/${cmd.name} - ${cmd.description}`).join("\n");
        }
    }

    // Si no es un comando, usar la IA
    const response = await getAIResponse([{ role: "user", content: message }]);
    return response.content;
} 