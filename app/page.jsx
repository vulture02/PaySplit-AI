import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { FEATURES, STEPS, TESTIMONIALS } from "@/lib/landing";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Home() {
  return (
    <div className="flex flex-col pt-16">
      {/* Hero Section */}
      <section className="mt-20 pb-12 space-y-10 md:space-y-15 px-5">
        <div className="container mx-auto px-4 md:px-6 text-center space-y-6">
          <Badge variant="outline" className="bg-sky-100 text-sky-700">
          Share costs. Stress less.
          </Badge>

          <h1 className="gradient-title mx-auto max-w-6xl text-4xl font-bold md:text-8xl">
              Track, split, and settle up with friends - no stress, just simplicity.
          </h1>

          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed">
              Easily track shared expenses, split bills with friends or roommates, and settle up instantly. With our app, you'll never have to worry about who owes what ever again.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row justify-center">
            <Button asChild size="lg" className="bg-sky-600 hover:bg-sky-700">
              <Link href="/dashboard">
                  Start your journey—get exploring today! <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-sky-600 text-sky-600 hover:bg-sky-50"
            >
              <Link href="#how-it-works">See How It Helps</Link>
            </Button>
          </div>
        </div>

        <div className="container mx-auto max-w-5xl overflow-hidden rounded-xl shadow-xl">
          <div className="gradient p-1 aspect-[16/9]">
            <Image
              src="/hero.png"
              width={1280}
              height={720}
              alt="Banner"
              className="rounded-lg mx-auto"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="specifications" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <Badge variant="outline" className="bg-sky-100 text-sky-700">
            Specifications
          </Badge>
          <h2 className="gradient-title mt-2 text-3xl md:text-4xl">
              Simplify splitting expenses—everything you need in one place.
          </h2>
          <p className="mx-auto mt-3 max-w-[700px] text-gray-500 md:text-xl/relaxed">
            Our platform provides a comprehensive suite of features to make managing shared expenses effortless. From tracking who owes what to settling up instantly, we’ve got you covered.
          </p>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ title, Icon, bg, color, description }) => (
              <Card
                key={title}
                className="flex flex-col items-center space-y-4 p-6 text-center"
              >
                <div className={`rounded-full p-3 ${bg}`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-gray-500">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section id="how-it-helps" className="py-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <Badge variant="outline" className="bg-sky-100 text-sky-700">
            How It helps
          </Badge>
          <h2 className="gradient-title mt-2 text-3xl md:text-4xl">
              Splitting expenses is now simpler, faster, and hassle-free.
          </h2>
          <p className="mx-auto mt-3 max-w-[700px] text-gray-500 md:text-xl/relaxed">
              Just follow these simple steps to start tracking and splitting expenses with friends effortlessly
          </p>

          <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3">
            {STEPS.map(({ label, title, description }) => (
              <div key={label} className="flex flex-col items-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-xl font-bold text-sky-600">
                  {label}
                </div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-gray-500 text-center">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <Badge variant="outline" className="bg-sky-100 text-sky-700">
            Testimonials
          </Badge>
          <h2 className="gradient-title mt-2 text-3xl md:text-4xl">
            Hear from our happy users
          </h2>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map(({ quote, name, role, image }, idx) => (
              <Card key={idx}>
                <CardContent className="space-y-4 p-6 text-left">
                  <p className="text-gray-500">{quote}</p>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={image} alt={name} />
                      <AvatarFallback>{name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{name}</p>
                      <p className="text-sm text-muted-foreground">{role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 gradient">
        <div className="container mx-auto px-4 md:px-6 text-center space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl text-white">
            Ready to start sharing expenses the easy way?
          </h2>
          <p className="mx-auto max-w-[600px] text-sky-100 md:text-xl/relaxed">
            Join thousands already enjoying stress-free expense splitting.
          </p>
          <Button asChild size="lg" className="bg-sky-800 hover:opacity-90">
            <Link href="/dashboard">
            Jump in and get exploring! <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Splendz. All rights reserved.
      </footer>
    </div>
  );
}
