"use client"

import { motion } from "framer-motion"

const providers = [
  { name: "Google", icon: "G" },
  { name: "Microsoft", icon: "M" },
  { name: "LinkedIn", icon: "in" },
]

export function SocialLogin() {
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-500">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {providers.map((provider, idx) => (
          <motion.button
            key={provider.name}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            disabled
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
              {provider.icon}
            </span>
            <span className="hidden sm:inline">{provider.name}</span>
          </motion.button>
        ))}
      </div>
      <p className="text-center text-xs text-slate-400">Social login coming soon</p>
    </div>
  )
}
