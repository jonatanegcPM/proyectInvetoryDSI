"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronRight, ChevronLeft, Check, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import confetti from "canvas-confetti"

// Pasos del onboarding con GIFs instructivos
const onboardingSteps = [
  {
    title: "Bienvenido a Farmacias Brasil",
    description:
      "Estamos emocionados de tenerte aquí. Vamos a guiarte a través de las principales características del sistema.",
    image: "/images/logo-2.jpg", // Mantener el logo estático
    isGif: false,
    tip: "Puedes saltar este tutorial en cualquier momento haciendo clic en 'Omitir'.",
  },
  {
    title: "Dashboard Principal",
    description:
      "El dashboard te muestra un resumen de las ventas, inventario y actividad reciente. Es tu centro de control para tomar decisiones informadas.",
    image: "/images/gifs/dashboard-demo.gif", // GIF mostrando navegación por el dashboard
    isGif: true,
    tip: "Puedes cambiar el rango de fechas para ver datos de diferentes períodos.",
  },
  {
    title: "Gestión de Inventario",
    description:
      "Mantén tu inventario organizado. Agrega productos, ajusta el stock y recibe alertas cuando los niveles sean bajos.",
    image: "/images/gifs/inventory-demo.gif", // GIF mostrando gestión de inventario
    isGif: true,
    tip: "Configura niveles de reorden para recibir alertas automáticas.",
  },
  {
    title: "Punto de Venta",
    description:
      "Realiza ventas de manera rápida y eficiente. Busca productos, selecciona clientes y procesa pagos en pocos clics.",
    image: "/images/gifs/pos-demo.gif", // GIF mostrando proceso de venta
    isGif: true,
    tip: "Usa el escáner de código de barras para agregar productos más rápido.",
  },
  {
    title: "¡Listo para comenzar!",
    description:
      "Has completado el recorrido básico. Ahora puedes comenzar a usar el sistema. Si necesitas ayuda, haz clic en el ícono del asistente.",
    image: "/images/gifs/assistant-demo.gif", // GIF mostrando el asistente
    isGif: true,
    tip: "Recuerda que siempre puedes acceder a la ayuda haciendo clic en el ícono del asistente en la esquina inferior derecha.",
  },
]

export function UserOnboarding() {
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({})
  const isLastStep = currentStep === onboardingSteps.length - 1

  // Verificar si el usuario ya ha visto el onboarding
  useEffect(() => {
    const onboardingStatus = localStorage.getItem("onboarding_completed")
    if (!onboardingStatus) {
      // Mostrar después de un breve retraso para permitir que la página se cargue
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1500)
      return () => clearTimeout(timer)
    } else {
      setHasSeenOnboarding(true)
    }
  }, [])

  // Efecto para lanzar confeti cuando llegamos al último paso
  useEffect(() => {
    if (isLastStep && isVisible) {
      launchConfetti()
    }
  }, [currentStep, isLastStep, isVisible])

  // Función para lanzar confeti
  const launchConfetti = () => {
    confetti({
      particleCount: 200,
      spread: 160,
      origin: { y: 0.6 },
      colors: ["#1e40af", "#0ea5e9", "#22c55e", "#eab308", "#ef4444"],
      zIndex: 9999,
      disableForReducedMotion: true,
    })
  }

  // Manejar el avance al siguiente paso
  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Simplemente completar el onboarding sin lanzar confeti de nuevo
      completeOnboarding()
    }
  }

  // Manejar el retroceso al paso anterior
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Completar el onboarding
  const completeOnboarding = () => {
    localStorage.setItem("onboarding_completed", "true")
    setIsVisible(false)
    setHasSeenOnboarding(true)
  }

  // Manejar la carga de imágenes/GIFs
  const handleImageLoad = (stepIndex: number) => {
    setImagesLoaded((prev) => ({
      ...prev,
      [stepIndex]: true,
    }))
  }

  // Si el usuario ya ha visto el onboarding, no mostrar nada
  if (hasSeenOnboarding) {
    return null
  }

  const currentStepData = onboardingSteps[currentStep]
  const isCurrentImageLoaded = imagesLoaded[currentStep]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl rounded-xl bg-card shadow-2xl border overflow-hidden"
          >
            {/* Botón de cerrar */}
            <Button variant="ghost" size="icon" onClick={completeOnboarding} className="absolute right-2 top-2 z-10">
              <X className="h-4 w-4" />
            </Button>

            {/* Contenido del paso actual */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Imagen/GIF */}
              <div className="relative flex items-center justify-center bg-gradient-to-br from-blue-600 to-green-500 p-8">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.5),transparent)]"></div>

                {/* Indicador de carga para GIFs */}
                {currentStepData.isGif && !isCurrentImageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                <img
                  src={currentStepData.image || "/placeholder.svg"}
                  alt={currentStepData.title}
                  className={`relative z-10 ${currentStepData.isGif ? "max-w-full max-h-60 object-cover rounded-md" : "max-h-60 object-contain rounded-md"}`}
                  onLoad={() => handleImageLoad(currentStep)}
                  style={{
                    opacity: isCurrentImageLoaded ? 1 : 0.3,
                    transition: "opacity 0.3s ease",
                  }}
                />
              </div>

              {/* Texto */}
              <div className="p-6 flex flex-col">
                <h2 className="text-xl font-bold mb-2">{currentStepData.title}</h2>
                <p className="text-sm text-muted-foreground mb-4">{currentStepData.description}</p>

                {/* Tip */}
                <div className="mt-auto">
                  <div className="flex items-start gap-2 bg-muted/50 p-3 rounded-lg mb-4">
                    <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5" />
                    <p className="text-xs">{currentStepData.tip}</p>
                  </div>

                  {/* Progreso */}
                  <div className="mb-4">
                    <Progress value={((currentStep + 1) / onboardingSteps.length) * 100} className="h-1" />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      Paso {currentStep + 1} de {onboardingSteps.length}
                    </p>
                  </div>

                  {/* Botones */}
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={completeOnboarding}>
                      Omitir
                    </Button>
                    <div className="flex gap-2">
                      {currentStep > 0 && (
                        <Button variant="outline" size="sm" onClick={handlePrevious}>
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Anterior
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={handleNext}
                        className={`${
                          isLastStep
                            ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                            : "bg-gradient-to-r from-blue-600 to-green-500"
                        } text-white`}
                      >
                        {isLastStep ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Finalizar
                          </>
                        ) : (
                          <>
                            Siguiente
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
