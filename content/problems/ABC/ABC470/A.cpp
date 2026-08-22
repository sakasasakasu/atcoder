#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int N;
    cin >> N;
    rep(i, N) { 
        if ((i + 1) % 3 == 0) {
            cout << "Fizz" << endl;
        } else {
            cout << i + 1 << endl;
        }
    }
}
