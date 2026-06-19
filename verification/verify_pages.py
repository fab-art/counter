from playwright.sync_api import sync_playwright

def run_cuj(page):
    urls = [
        "http://localhost:3000/officer/dashboard",
        "http://localhost:3000/tasks",
        "http://localhost:3000/investigations"
    ]

    for i, url in enumerate(urls):
        print(f"Verifying {url}")
        try:
            page.goto(url)
            page.wait_for_timeout(3000)
            page.screenshot(path=f"/app/verification/screenshots/page_{i}.png")
        except Exception as e:
            print(f"Error verifying {url}: {e}")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/app/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
