package main

import (
	"fmt"
	"sync"
	"time"
)

// Semaforo con channels

func main() {
	var wg sync.WaitGroup
	c := make(chan int, 5)

	for i := 0; i < 10; i++ {
		wg.Add(1)
		c <- 1
		go doSomething(i, &wg, c)
	}

	fmt.Println("Waiting for goroutines to finish")

	wg.Wait()

}

func doSomething(i int, wg *sync.WaitGroup, c chan int) {
	defer wg.Done()

	fmt.Printf("id: %d started \n", i)
	time.Sleep(4 * time.Second)
	fmt.Printf("id: %d finished \n", i)

	<-c
}