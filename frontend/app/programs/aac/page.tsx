import type { Metadata } from "next"
import AacProgramClient from "./aac-program-client"

export const metadata: Metadata = {
  title: "Advancing Agricultural Circularity (AAC) | Impact Hub Nairobi",
  description:
    "Closing the loop, together. AAC is a multi-stakeholder programme shifting Kenya's agri-food system toward circular, regenerative models — convening 38 ecosystem actors, training 150 farmers, and testing market activation.",
  openGraph: {
    title: "Advancing Agricultural Circularity (AAC)",
    description:
      "A multi-stakeholder initiative by Impact Hub Nairobi — ecosystem activation, farmer training, and consumer market testing across Kiambu County.",
  },
}

export default function AacProgramPage() {
  return <AacProgramClient />
}
