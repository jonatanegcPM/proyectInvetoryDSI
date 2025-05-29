"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, MapPin, Phone, Mail, Heart, Shield, Users, Pill, Stethoscope, Truck, Star } from "lucide-react"
import { useState, useEffect } from "react"

export default function LandingPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const testimonials = [
    {
      text: "Farmacias Brasil ha sido nuestra farmacia de confianza durante más de 8 años. Siempre encuentro lo que necesito y el personal es muy profesional y amable.",
      author: "Carmen Rodríguez",
      detail: "Cliente desde 2015",
    },
    {
      text: "El servicio de entrega a domicilio es excelente. Mis medicamentos llegan siempre a tiempo y en perfectas condiciones. Muy recomendado.",
      author: "Miguel Hernández",
      detail: "Cliente desde 2018",
    },
    {
      text: "Los farmacéuticos son muy conocedores y siempre me ayudan con mis dudas sobre medicamentos. Es un lugar de confianza para toda la familia.",
      author: "Ana Martínez",
      detail: "Cliente desde 2020",
    },
    {
      text: "Precios justos y gran variedad de productos. Además, aceptan mi seguro médico sin problemas. Definitivamente mi farmacia favorita.",
      author: "Roberto Castillo",
      detail: "Cliente desde 2017",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/farmacias-brasil-logo-green.png"
              alt="Farmacias Brasil Logo"
              width={60}
              height={60}
              className="h-14 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold text-emerald-700">Farmacias Brasil</h1>
              <p className="text-sm text-gray-600">Tu salud, nuestra prioridad</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#servicios" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Servicios
            </a>
            <a href="#productos" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Productos
            </a>
            <a href="#ubicaciones" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Ubicaciones
            </a>
            <a href="#contacto" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Contacto
            </a>
          </nav>

          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              className="!text-emerald-700 !border-emerald-200 hover:!bg-emerald-50 !bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
            >
              Acceso Empleados
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-white to-green-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Cuidando tu <span className="text-emerald-600">salud</span> desde 1990
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Somos la farmacia de confianza de miles de familias salvadoreñas. Ofrecemos medicamentos de calidad,
                atención personalizada y servicios de salud integral para toda la comunidad.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 !text-white !bg-emerald-600 hover:!bg-emerald-700"
                  onClick={() => {
                    document.getElementById("ubicaciones")?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  Encuentra tu sucursal
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="!border-emerald-200 !text-emerald-700 hover:!bg-emerald-50 !bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  onClick={() => {
                    document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Consulta telefónica
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/landing-images/image-1.jpeg"
                  alt="Farmacéutica profesional en Farmacias Brasil"
                  width={600}
                  height={500}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/30 to-transparent"></div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">24/7</p>
                    <p className="text-sm text-gray-600">Servicio disponible</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">25,000+</p>
                    <p className="text-sm text-gray-600">Clientes satisfechos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Nuestros Servicios</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ofrecemos una amplia gama de servicios farmacéuticos y de salud para cuidar de ti y tu familia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:!shadow-lg transition-shadow !border-0 !shadow-md !bg-white !text-gray-900 [&_*]:!text-gray-900 [&_.text-muted-foreground]:!text-gray-600 !border-gray-200">
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Pill className="h-8 w-8 text-emerald-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">Medicamentos</h4>
                <p className="text-gray-600 mb-4">
                  Amplio catálogo de medicamentos genéricos y de marca, siempre con la mejor calidad y precios
                  competitivos.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Medicamentos con receta</li>
                  <li>• Medicamentos de venta libre</li>
                  <li>• Medicamentos especializados</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:!shadow-lg transition-shadow !border-0 !shadow-md !bg-white !text-gray-900 [&_*]:!text-gray-900 [&_.text-muted-foreground]:!text-gray-600 !border-gray-200">
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Stethoscope className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">Consultas Farmacéuticas</h4>
                <p className="text-gray-600 mb-4">
                  Nuestros farmacéuticos certificados te brindan asesoría personalizada sobre medicamentos y salud.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Revisión de medicamentos</li>
                  <li>• Asesoría sobre interacciones</li>
                  <li>• Seguimiento farmacoterapéutico</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:!shadow-lg transition-shadow !border-0 !shadow-md !bg-white !text-gray-900 [&_*]:!text-gray-900 [&_.text-muted-foreground]:!text-gray-600 !border-gray-200">
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-8 w-8 text-red-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">Servicios de Salud</h4>
                <p className="text-gray-600 mb-4">
                  Servicios adicionales para el cuidado integral de tu salud y bienestar.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Medición de presión arterial</li>
                  <li>• Control de glucosa</li>
                  <li>• Aplicación de inyecciones</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:!shadow-lg transition-shadow !border-0 !shadow-md !bg-white !text-gray-900 [&_*]:!text-gray-900 [&_.text-muted-foreground]:!text-gray-600 !border-gray-200">
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">Seguros Médicos</h4>
                <p className="text-gray-600 mb-4">
                  Aceptamos la mayoría de seguros médicos para facilitar el acceso a tus medicamentos.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• ISSS (Instituto Salvadoreño del Seguro Social)</li>
                  <li>• Seguros privados</li>
                  <li>• Planes corporativos</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:!shadow-lg transition-shadow !border-0 !shadow-md !bg-white !text-gray-900 [&_*]:!text-gray-900 [&_.text-muted-foreground]:!text-gray-600 !border-gray-200">
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Truck className="h-8 w-8 text-orange-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">Entrega a Domicilio</h4>
                <p className="text-gray-600 mb-4">
                  Recibe tus medicamentos en la comodidad de tu hogar con nuestro servicio de entrega.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Entrega el mismo día</li>
                  <li>• Seguimiento en tiempo real</li>
                  <li>• Entrega gratuita en pedidos +$25</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:!shadow-lg transition-shadow !border-0 !shadow-md !bg-white !text-gray-900 [&_*]:!text-gray-900 [&_.text-muted-foreground]:!text-gray-600 !border-gray-200">
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">Programa de Fidelidad</h4>
                <p className="text-gray-600 mb-4">
                  Únete a nuestro programa y obtén descuentos exclusivos y beneficios especiales.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Descuentos progresivos</li>
                  <li>• Ofertas exclusivas</li>
                  <li>• Puntos por compras</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Showcase */}
      <section id="productos" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Productos Destacados</h3>
            <p className="text-xl text-gray-600">Encuentra todo lo que necesitas para tu salud y bienestar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-80">
              <Image
                src="/images/landing-images/image-2.jpeg"
                alt="Medicamentos especializados"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h4 className="text-xl font-bold mb-2">Medicamentos Especializados</h4>
                  <p className="text-emerald-100">Tratamientos específicos para condiciones complejas</p>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-80">
              <Image
                src="/images/landing-images/image-3.jpeg"
                alt="Productos de cuidado personal"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h4 className="text-xl font-bold mb-2">Cuidado Personal</h4>
                  <p className="text-blue-100">Productos para el cuidado diario de tu salud</p>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-80">
              <Image
                src="/images/landing-images/image-4.jpeg"
                alt="Vitaminas y suplementos"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h4 className="text-xl font-bold mb-2">Vitaminas y Suplementos</h4>
                  <p className="text-purple-100">Complementos nutricionales para tu bienestar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Experience */}
      <section className="py-20 bg-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/landing-images/image-5.jpeg"
            alt="Cliente satisfecha"
            fill
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h3 className="text-4xl font-bold mb-6">La experiencia de nuestros clientes</h3>
            <p className="text-xl text-emerald-100 mb-12">
              Miles de familias salvadoreñas confían en nosotros para el cuidado de su salud
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">33+</div>
                <div className="text-emerald-100">Años de experiencia</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">70</div>
                <div className="text-emerald-100">Sucursales en El Salvador</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">25K+</div>
                <div className="text-emerald-100">Clientes satisfechos</div>
              </div>
            </div>

            <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-8 transition-all duration-500">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <blockquote className="text-xl italic text-white mb-4 min-h-[3rem] flex items-center justify-center text-center">
                "{testimonials[currentTestimonial].text}"
              </blockquote>
              <cite className="text-emerald-200 block text-center">
                - {testimonials[currentTestimonial].author}, {testimonials[currentTestimonial].detail}
              </cite>
              <div className="flex justify-center mt-6 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentTestimonial ? "bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section id="ubicaciones" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Nuestras Ubicaciones</h3>
            <p className="text-xl text-gray-600">Encuentra la sucursal más cercana a ti</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sucursal Centro",
                address: "Av. Roosevelt 1234, San Salvador",
                hours: "Lun-Dom: 7:00 AM - 11:00 PM",
                phone: "+503 2234-5678",
              },
              {
                name: "Sucursal Santa Ana",
                address: "Calle Libertad 567, Santa Ana",
                hours: "Lun-Dom: 8:00 AM - 10:00 PM",
                phone: "+503 2445-6789",
              },
              {
                name: "Sucursal San Miguel",
                address: "Av. Gerardo Barrios 890, San Miguel",
                hours: "24 horas",
                phone: "+503 2661-2345",
              },
              {
                name: "Sucursal Soyapango",
                address: "Blvd. del Ejército 345, Soyapango",
                hours: "Lun-Dom: 7:00 AM - 10:00 PM",
                phone: "+503 2276-7890",
              },
              {
                name: "Sucursal Mejicanos",
                address: "Calle Principal 123, Mejicanos",
                hours: "Lun-Dom: 8:00 AM - 9:00 PM",
                phone: "+503 2235-4567",
              },
              {
                name: "Sucursal Antiguo Cuscatlán",
                address: "Av. Las Magnolias 456, Antiguo Cuscatlán",
                hours: "Lun-Dom: 7:00 AM - 11:00 PM",
                phone: "+503 2243-8901",
              },
            ].map((location, index) => (
              <Card
                key={index}
                className="hover:!shadow-lg transition-shadow !bg-white !text-gray-900 [&_*]:!text-gray-900 [&_.text-muted-foreground]:!text-gray-600 !border-gray-200 !shadow-md"
              >
                <CardContent className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">{location.name}</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-emerald-600 mt-0.5" />
                      <span className="text-gray-600">{location.address}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-emerald-600 mt-0.5" />
                      <span className="text-gray-600">{location.hours}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-emerald-600 mt-0.5" />
                      <span className="text-gray-600">{location.phone}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 !bg-emerald-600 hover:!bg-emerald-700 !text-white bg-emerald-600 hover:bg-emerald-700">
                    Ver en mapa
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contacto" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-gray-900 mb-4">Contáctanos</h3>
              <p className="text-xl text-gray-600">Estamos aquí para ayudarte con todas tus necesidades de salud</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h4 className="text-2xl font-bold text-gray-900 mb-6">Información de Contacto</h4>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Phone className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Teléfono</p>
                      <p className="text-gray-600">+503 2234-5678</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Mail className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Email</p>
                      <p className="text-gray-600">info@farmaciasbrasil.com.sv</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Oficina Principal</p>
                      <p className="text-gray-600">Av. Roosevelt 1234, San Salvador</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-2xl font-bold text-gray-900 mb-6">Horarios de Atención</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Lunes - Viernes</span>
                    <span className="font-semibold text-gray-900">7:00 AM - 11:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Sábados</span>
                    <span className="font-semibold text-gray-900">8:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Domingos</span>
                    <span className="font-semibold text-gray-900">9:00 AM - 9:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Emergencias</span>
                    <span className="font-semibold text-emerald-600">24/7 Disponible</span>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-emerald-50 rounded-xl">
                  <h5 className="font-bold text-emerald-800 mb-2">¿Necesitas ayuda urgente?</h5>
                  <p className="text-emerald-700">
                    Nuestro servicio de emergencia está disponible las 24 horas para consultas urgentes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Image
                  src="/images/farmacias-brasil-logo-green.png"
                  alt="Farmacias Brasil Logo"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
                <div>
                  <h4 className="text-xl font-bold">Farmacias Brasil</h4>
                  <p className="text-sm text-gray-400">Tu salud, nuestra prioridad</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Cuidando la salud de las familias salvadoreñas desde 1990 con calidad, confianza y profesionalismo.
              </p>
            </div>

            <div>
              <h5 className="text-lg font-bold mb-4">Servicios</h5>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                    Medicamentos
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                    Consultas
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                    Entrega a domicilio
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                    Seguros médicos
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-lg font-bold mb-4">Información</h5>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                    Sobre nosotros
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                    Ubicaciones
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                    Programa de fidelidad
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                    Trabaja con nosotros
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-lg font-bold mb-4">Contacto</h5>
              <ul className="space-y-2 text-gray-400">
                <li>+503 2234-5678</li>
                <li>info@farmaciasbrasil.com.sv</li>
                <li>Av. Roosevelt 1234, San Salvador</li>
              </ul>
              <div className="flex space-x-4 mt-6">
                <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="#" aria-label="WhatsApp" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
