package main

import "fmt"

func Worker(id int, jobs <- chan int, results chan <- int) {
	for job := range jobs {
		fmt.Printf("--> Worker #%d started fib with %d\n", id, job)
		fib := Fibo(job)
		fmt.Printf("Worker #%d finished. Job: %d; Fibo: %d\n", id, job, fib)
		results <- fib
	}
}

func Fibo(n int) int {
	if n <= 1 {
		return n
	}

	return Fibo(n - 1) + Fibo(n - 2)
}

func main() {
	tasks := []int{2, 3, 4, 7, 10, 15}
	nWorkers := 3
	jobs := make(chan int, len(tasks))
	results := make(chan int, len(tasks))

	// creates the workers
	for i := 0; i < nWorkers; i++ {
		go Worker(i, jobs, results)
	}

	// sends them to work
	for _, v := range tasks {
		jobs <- v
	}

	// close channel to indicate that's all the work to do
	close(jobs)

	for i := 0; i < len(tasks); i++ {
		<- results
	}
}