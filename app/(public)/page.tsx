// this page should be used only as a splash page to decide where a user should be navigated to
// when logged in --> to /heists
// when not logged in --> to /login

import { Clock8 } from "lucide-react"

export default function Home() {
  return (
    <div className="center-content">
      <div className="page-content">
        <h1>
          P<Clock8 className="logo" strokeWidth={2.75} />cket Heist
        </h1>
        <div>Tiny missions. Big office mischief.</div>
        <p>
          Welcome to Pocket Heist — the app that turns your office into a
          playground. Create sneaky missions, assign them to your colleagues,
          and rack up points for pulling off the perfect heist.
        </p>
        <p>
          Whether you&apos;re stealing someone&apos;s chair, reorganising the
          snack drawer, or orchestrating a full desk swap — every mission counts.
          Log in to see your active heists or sign up to start your first one.
        </p>
      </div>
    </div>
  )
}
