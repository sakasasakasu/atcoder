#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int A, B;
    cin >> A >> B;
    if (A+B == 9 || A-B == 9 || A*B == 9 || A == 9*B) {
        cout << "Nine" << endl;
    } else {
        cout << "Nein" << endl;
    }
     return 0;
}
